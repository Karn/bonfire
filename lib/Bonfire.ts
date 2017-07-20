import * as NodeSchedule from 'node-schedule'
import { Utils } from './misc/Utils'
import { BonfireJob } from './model/BonfireJob'
import * as Firebase from 'firebase-admin'

namespace Bonfire {
    export type JobCompletionHandler = (key: string, job: BonfireJob) => void
    export type JobCreatedResult = (job: BonfireJob) => void
    export type ErrorResult = (error: Error) => void

    export class Scheduler {

        /**
         * Maintains a list of local jobs.
         */
        public jobList: Map<string, NodeSchedule.Job>

        private bonfireRef: Firebase.database.Reference

        private jobCompletionHandler: JobCompletionHandler

        /**
         * @param reference A reference to the Firebase database node.
         */
        public constructor(reference: Firebase.database.Reference, jobCompletionHandler: JobCompletionHandler) {
            if (!reference) {
                throw new Error('Bonfire: Attempt to instantiate with invalid reference.')
            }

            // Store the Firebase Reference so that it can be used at a later time.
            this.bonfireRef = reference

            // Attach the jobCompletionHandler.
            this.jobCompletionHandler = jobCompletionHandler

            this.jobList = new Map<string, NodeSchedule.Job>()

            this.queueExistingJobs()
        }

        /**
         * Firebase reference that was used to create this `Bonfire` instance.
         */
        public getRef(): Firebase.database.Reference {
            return this.bonfireRef
        }

        /**
         * Process jobs that may have not been started due to a server restart.
         */
        private queueExistingJobs(): void {

            // Lookup the reference to the node in an attempt to queue jobs after
            // instantiation.
            this.bonfireRef.once('value')
                .then((nodeSnapshot: Firebase.database.DataSnapshot) => {

                    // Ensure that the object exists.
                    if (!nodeSnapshot.exists()) {
                        // Job node does not exist. Nothin to do here.
                        return
                    }

                    // Iterate through the jobs and requeue as neccessart.
                    nodeSnapshot.forEach((jobSnapshot: Firebase.database.DataSnapshot) => {

                        // Ensure that the object exists.
                        if (!jobSnapshot.exists()) {
                            // Job does not exist. Nothin to do here.
                            return false
                        }

                        // Parse the snapshot into its corresponding Job object.
                        let job: BonfireJob = BonfireJob.fromJson(jobSnapshot.val())

                        // Delegate the job item to the actual job scheduler.
                        this.scheduleJob(job)

                        // Returning true exits from the iterator.
                        return false
                    })
                })
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

                        // Notify the completion handler about the job.
                        this.jobCompletionHandler(key, BonfireJob.fromJson(jobSnapshot.val()))

                        // We then delete the job from the referenced node.
                        jobSnapshot.ref.remove()
                    })
            }
        }

        /**
         * Scheduled a job and store its metadata to initially defined Firebase
         * database reference.
         * 
         * @param job   A job object describing the contents and payload of the job.
         */
        public schedule(job: BonfireJob): Promise<BonfireJob> {
            return new Promise<BonfireJob>((resolve: JobCreatedResult, reject: ErrorResult) => {

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

                        // Delegate the job item to the actual job scheduler.
                        this.scheduleJob(job)

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

        private scheduleJob(job: BonfireJob) {
            if (this.jobList.has(job.getKey())) {
                // Skip scheduling job for a key that already exists.
                return
            }

            // Create the scheduled job
            const scheduledJob: NodeSchedule.Job = NodeSchedule.scheduleJob(
                job.getKey(),
                job.getScheduledDateTime(),
                this.getJobCallback(job.getKey())
            )

            // Add the new job to the list of jobs.
            this.jobList.set(job.getKey(), scheduledJob);
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
                        let job: NodeSchedule.Job = this.jobList.get(key)
                        job.cancel()

                        this.jobList.delete(key)

                        resolve()
                    }).catch(reject)
            })
        }
    }
}

export {
    Bonfire,
    BonfireJob
}
