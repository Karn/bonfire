import { ITask } from './ITask';

/**
 * Provides a skeleton for a Scheduler; All operations must be fully
 * implemented.
 */
export interface IScheduler {

    /**
     * Queue existing tasks. Useful when, for example, the implementing product
     * restarts and needs to continue to process Tasks seamlessly.
     * 
     * @param tasks A collection of Tasks that are to be scheduled.
     * @return  A promise that resolves once the operation is complete.
     */
    queueExisting(tasks: Array<ITask>): Promise<void>

    /**
     * Determine the number of locally queued Tasks.
     * 
     * @return  The count of locally queued Tasks as a number.
     */
    getPendingCount(): number

    /**
     * Fetch a particular Task from a given key.
     * 
     * @param key   Used to identify what Task is being retrieved.
     * @return  A Promise that resolves with a Task that corresponds to the
     *          given key or null if it does not exist.
     */
    get(key: string): Promise<ITask>

    /**
     * Schedules a given Task for execution at a later Date/Time.
     * 
     * @param task  The Task that is being scheduled.
     * @return  A Promise which resolves with the same task that is provided or
     *          with another task for which the given key maps to. I.e if
     *          another Task has been scheduled with the same key, that Task is
     *          returned.
     */
    schedule(task: ITask): Promise<ITask>

    /**
     * Cancel an existing Task which is scheduled for exectution.
     * 
     * @param key   The key associated with the Task that is being cancelled.
     * @return  A Promise which resolves once the operation has completed.
     */
    cancel(key: string): Promise<void>
}
