import { IScheduler } from './../descriptors/IScheduler'
import * as Firebase from 'firebase-admin'
import { FirebaseRedundancyService } from './FirebaseRedundancyService'
import * as NodeSchedule from 'node-schedule'
import { Handlers } from '../utils/Handlers'
import { ITask } from '../descriptors/ITask';
import { Errors } from "../utils/Errors";

class Scheduler implements IScheduler {

    /**
     * Maintains a list of local jobs.
     */
    private jobList: Map<string, NodeSchedule.Job>

    private redundancyService: FirebaseRedundancyService

    private jobCompletionHandler: Handlers.JobCompletionHandler

    public constructor(reference: Firebase.database.Reference, jobCompletionHandler: Handlers.JobCompletionHandler) {
        // Attach the redundancy service
        this.redundancyService = new FirebaseRedundancyService(reference)

        // Attach the jobCompletionHandler.
        this.jobCompletionHandler = jobCompletionHandler

        // Build the local mapping of jobs.
        this.jobList = new Map<string, NodeSchedule.Job>()

        // Reque the exsting tasks.
        this.redundancyService.getAll().then((tasks: Array<ITask>) => {
            this.queueExisting(tasks)
        }).catch((error: Error) => {
            // Error ocurred while fetching exisiting jobs. Re-throw
            throw error
        })
    }

    /**
     * Generates a callback which is executed when the given job is 
     * scheduled.
     *
     * @param key   The firebase key associated with the job.
     * @return  A function which acts as a callback for when a callback is issued.
     */
    private getJobCallback(key: string): (() => void) {
        return async () => {
            if (!this.jobCompletionHandler) {
                // There is no callback attached skip processing.
                // TODO: Warn the user.
                return
            }

            let task: ITask = await this.redundancyService.fetch(key)

            // Ensure that the object exists.
            if (!task) {
                // Job does not exist. Nothin to do here.
                return
            }

            // Notify the completion handler about the job.
            this.jobCompletionHandler(key, task)

            // We then delete the job from the referenced node.
            await this.redundancyService.remove(key)
        }
    }

    /**
     * Leverage the NodeSchedule library to schedule a one time job.
     * 
     * @param job The job that is being scheduled.
     */
    private scheduleJob(job: ITask): void {
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
     * Process tasks that may have not been started due to a server restart.
     * 
     * @param tasks A collection of tasks that are to be queued.
     * @return  A Promise which resolves when all existing tasks have been
     *          queued.
     */
    public async queueExisting(tasks: Array<ITask>): Promise<void> {
        // If there are no existing tasks, theres nothing to do.
        if (!tasks) {
            return
        }

        tasks.forEach((task: ITask) => {
            // Ensure that the job is in the future.
            if (task.getScheduledDateTime().getTime() < Date.now()) {
                // Cannot schedule a job to complete in a time that no
                // longer exists. We notify on the callback so that the
                // case can be handled.
                this.jobCompletionHandler(task.getKey(), task)
                this.redundancyService.remove(task.getKey())
            } else {
                // Delegate the job item to the actual job scheduler.
                this.scheduleJob(task)
            }
        });
    }

    /**
     * 
     * @see IScheduler#get(string)
     */
    public async get(key: string): Promise<ITask> {
        return await this.redundancyService.fetch(key)
    }

    public getPendingCount(): number {
        return this.jobList.size
    }

    public async schedule(task: ITask): Promise<ITask> {

        // Ensure that the job is in the future.
        if (task.getScheduledDateTime().getTime() < Date.now()) {
            throw new Error(Errors.SCHEDULED_IN_PAST)
        }

        // In the event that we are starting a job as a result of a server
        // refresh, we enable this variable so that we don't waste cycles.
        let shouldCreateLocallyOnly: boolean = false

        let existingTask: ITask = await this.redundancyService.fetch(task.getKey())
        if (existingTask) {
            // Check if we already have the job queued
            if (this.jobList.has(task.getKey())) {
                // The job already exists; nothing to do here.
                return existingTask
            }

            // Enable flag the allows the session to be created locally.
            shouldCreateLocallyOnly = true
        }

        // Delegate the job item to the actual job scheduler.
        this.scheduleJob(task)

        if (!shouldCreateLocallyOnly) {
            // Create job with the key in the jobItem and with the data being
            // the data from the JobItem.
            await this.redundancyService.commit(task)
        }

        return task
    }

    public async cancel(key: string): Promise<void> {
        // Validate key
        if (!this.jobList.has(key)) {
            return
        }

        // Removed the serialized copy.
        await this.redundancyService.remove(key)

        // Fetch local copy.
        let job: NodeSchedule.Job | undefined = this.jobList.get(key)

        // Cancel keys
        if (job) job.cancel()
        this.jobList.delete(key)
    }

}

export {
    Scheduler
}
