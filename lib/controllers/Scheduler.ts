import { Errors } from './../utils/Errors'
import { FirebaseRedundancyService } from './FirebaseRedundancyService'
import { Handlers } from './../utils/Handlers'
import { IScheduler } from './../descriptors/IScheduler'
import { ITask } from './../descriptors/ITask'
import * as Firebase from 'firebase-admin'
import * as NodeSchedule from 'node-schedule'

/**
 * This implementation of the scehduler object provides task management with a
 * Firebase backbone.
 */
class Scheduler implements IScheduler {

    /**
     * Maintains a list of local tasks.
     */
    private taskList: Map<string, NodeSchedule.Job>

    private redundancyService: FirebaseRedundancyService

    /**
     * A handler that is executed when a task has completed.
     */
    private taskCompletionHandler: Handlers.TaskCompletionHandler

    public constructor(reference: Firebase.database.Reference,
        taskCompletionHandler: Handlers.TaskCompletionHandler) {

        // Attach the redundancy service
        this.redundancyService = new FirebaseRedundancyService(reference)

        // Attach the jobCompletionHandler.
        this.taskCompletionHandler = taskCompletionHandler

        // Build the local mapping of jobs.
        this.taskList = new Map<string, NodeSchedule.Job>()

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
     * @return  A function which acts as a callback for when a callback is
     *          issued.
     */
    private getJobCallback(key: string): (() => void) {
        return async () => {
            if (!this.taskCompletionHandler) {
                // There is no callback attached skip processing.
                // TODO: Warn the user.
                return
            }

            const task: ITask = await this.redundancyService.fetch(key)

            // Ensure that the object exists.
            if (!task) {
                // Job does not exist. Nothin to do here.
                return
            }

            // Notify the completion handler about the job if it exits.
            if (this.taskCompletionHandler) {
                this.taskCompletionHandler(key, task)
            }

            // We then delete the job from the referenced node.
            await this.redundancyService.remove(key)
        }
    }

    /**
     * Leverage the NodeSchedule library to schedule a one time job.
     *
     * @param task  The task that is being scheduled.
     */
    private scheduleTask(task: ITask): void {
        if (this.taskList.has(task.getKey())) {
            // Skip scheduling job for a key that already exists.
            return
        }

        // Create the scheduled task.
        const scheduledJob: NodeSchedule.Job = NodeSchedule.scheduleJob(
            task.getKey(),
            task.getScheduledDateTime(),
            this.getJobCallback(task.getKey())
        )

        // Add the new job to the list of tasks.
        this.taskList.set(task.getKey(), scheduledJob);
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
                this.taskCompletionHandler(task.getKey(), task)
                this.redundancyService.remove(task.getKey())
            } else {
                // Delegate the job item to the actual job scheduler.
                this.scheduleTask(task)
            }
        });
    }

    /**
     * Fetch a given task by key.
     *
     * @see IScheduler#get(string)
     */
    public async get(key: string): Promise<ITask> {
        return await this.redundancyService.fetch(key)
    }

    /**
     * Returns the number of pending tasks.
     *
     * @return The number of tasks that are queued.
     */
    public getPendingCount(): number {
        return this.taskList.size
    }

    /**
     * Schedule a given task.
     *
     * @param task  The task that is being scheduled.
     */
    public async schedule(task: ITask): Promise<ITask> {

        // Ensure that the job is in the future.
        if (task.getScheduledDateTime().getTime() < Date.now()) {
            throw new Error(Errors.SCHEDULED_IN_PAST)
        }

        // In the event that we are starting a job as a result of a server
        // refresh, we enable this variable so that we don't waste cycles.
        let shouldCreateLocallyOnly: boolean = false

        // Fetch the task associated with that key.
        const existingTask: ITask = await this.redundancyService
            .fetch(task.getKey())

        if (existingTask) {
            // Check if we already have the job queued.
            if (this.taskList.has(task.getKey())) {
                // The job already exists; nothing to do here.
                return existingTask
            }

            // Enable flag the allows the session to be created locally.
            shouldCreateLocallyOnly = true
        }

        // Delegate the job item to the actual job scheduler.
        this.scheduleTask(task)

        if (!shouldCreateLocallyOnly) {
            // Create job with the key in the jobItem and with the data being
            // the data from the JobItem.
            await this.redundancyService.commit(task)
        }

        return task
    }

    /**
     * Cancel a pending task by key.
     *
     * @param key   The key that identifies the task that is to be cancelled.
     */
    public async cancel(key: string): Promise<void> {
        // Validate key
        if (!this.taskList.has(key)) {
            return
        }

        // Removed the serialized copy.
        await this.redundancyService.remove(key)

        // Fetch local copy.
        const job: NodeSchedule.Job | undefined = this.taskList.get(key)

        // Cancel keys
        if (job) {
            job.cancel()
        }

        this.taskList.delete(key)
    }
}

export {
    Scheduler
}
