import * as Firebase from 'firebase-admin'
import * as NodeSchedule from 'node-schedule'
import { Utils } from './misc/Utils';
import { Job } from './model/Job';

export namespace Bonfire {
    export type JobCompletionHandler = (jobKey: string, job: Job) => void
    export type JobCreatedResult = (job: Job) => void
    export type ErrorResult = (error: Error) => void

}

export default class Bonfire {

    /**
     * Maintains a list of local jobs.
     */
    public jobList: Map<string, NodeSchedule.Job>

    private bonfireRef: Firebase.database.Reference

    private jobCompletionHandler: Bonfire.JobCompletionHandler

    /**
     * @param reference A reference to the Firebase database node.
     */
    public constructor(reference: Firebase.database.Reference, jobCompletionHandler: Bonfire.JobCompletionHandler) {
        if (!reference) {
            throw new Error('Bonfire: Attempt to instantiate with invalid reference.')
        }

        // Store the Firebase Reference so that it can be used at a later time.
        this.bonfireRef = reference

        // Attach the jobCompletionHandler.
        this.jobCompletionHandler = jobCompletionHandler

        this.jobList = new Map<string, NodeSchedule.Job>()
    }

    /**
     * Firebase reference that was used to create this `Bonfire` instance.
     */
    public getRef(): Firebase.database.Reference {
        return this.bonfireRef
    }


    /**
     * Generates a callback which is executed when the given job is scheduled.
     *
     * @param key   The firebase key associated with the job.
     */
    private getJobCallback(key: string): (() => void) {
        return () => {
            if (!this.jobCompletionHandler) {
                // There is no callback attached skip processing.
                // TODO: Warn the user.
                return
            }

            this.bonfireRef.child(key).once('value')
                .then((jobSnapshot: Firebase.database.DataSnapshot) => {

                    // Ensure that the object exists.
                    if (!jobSnapshot.exists()) {
                        // Job does not exist. Nothin to do here.
                        return
                    }

                    this.jobCompletionHandler(key, Job.fromJson(jobSnapshot.val()))
                })
        }
    }

    /**
     * Scheduled a job and store its metadata to initially defined Firebase
     * database reference.
     * 
     * @param job   A job object describing the contents and payload of the job.
     */
    public schedule(job: Job): Promise<Job> {
        return new Promise<Job>((resolve: Bonfire.JobCreatedResult, reject: Bonfire.ErrorResult) => {

            // Ensure the job has a key.
            if (!job.getKey()) {
                reject(new Error('Cannot process job without a key.'))
                return
            }

            this.bonfireRef.child(job.getKey()).once('value')
                .then((jobSnapshot: Firebase.database.DataSnapshot) => {
                    // In the event that we are starting a job as a result of a server refresh, we enable
                    // this variable so that we don't waste cycles.
                    let shouldCreateLocallyOnly: boolean = false

                    if (jobSnapshot.exists()) {

                        // Check if we already have the job queued
                        if (!this.jobList.has(job.getKey())) {
                            // The job already exists; nothing to do here.
                            resolve(job)
                            return
                        }

                        // Enable flag the allows the session to be created locally.
                        shouldCreateLocallyOnly = true
                    }

                    // Create the scheduled job
                    const scheduledJob: NodeSchedule.Job = NodeSchedule.scheduleJob(
                        job.getKey(),
                        job.getScheduledDateTime(),
                        this.getJobCallback(job.getKey())
                    )

                    // Add the new job to the list of jobs.
                    this.jobList.set(job.getKey(), scheduledJob);

                    if (shouldCreateLocallyOnly) {
                        // Since we only want to create it locally, we will complete here.
                        resolve(job)
                        return
                    }

                    // Create job with the key in the jobItem and with the data being the data from the JobItem.
                    jobSnapshot.ref.set(job.asJson())
                        .then(() => {
                            resolve(job)
                        }).catch(reject)
                })
        })
    }

    /**
     * Cancel a pending job and remove the Firebase node in the process.
     * 
     * @param key   The key associated with the job.
     */
    public cancel(key: string): Promise<void> {
        return new Promise<void>((resolve: any, reject: any) => {
            this.bonfireRef.child(key).remove()
                .then(() => {

                    // Validate key
                    if (!this.jobList.has(key)) {
                        resolve()
                        return
                    }

                    // Cancel keys
                    this.jobList.get(key).cancel()
                    this.jobList.delete(key)

                    resolve()
                }).catch(reject)
        })
    }

}

