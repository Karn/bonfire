import { ITask } from './ITask';

/**
 * Provides a skeleton for redundancy mechanisms; All operations must be fully
 * implemented.
 */
export interface IRedundancyService {

    /**
     * Return a list of all existing Tasks from the redundancy service.
     */
    getAll(): Promise<ITask[]>

    /**
     * Performs a lookup and retrieves a Task implementation from the
     * redundancy service.
     * 
     * @param key   A unique identifier for a given Task.
     * @return  A Promise that resolves with the task if it exists otherwise it
     *          resolves with null.
     */
    fetch(key: string): Promise<ITask>

    /**
     * Takes in, serializes and stores a Task implementation for the purposes
     * of redundancy. Note: This overwrites existing data if the key matches.
     * 
     * @param task  The task that is being stored.
     * @return  A Promise that resolves if the commit was completed
     *          successfully.
     */
    commit(task: ITask): Promise<void>

    /**
     * Removes a Task implementaion from the redundancy mechanism based on the
     * provided key.
     * 
     * @param key   A unique identifier for a given Task.
     * @return  A promise that resolves if the removal was completed
     *          successfully.
     */
    remove(key: string): Promise<void>
}
