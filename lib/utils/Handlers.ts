import { ITask } from './../descriptors/ITask'

/**
 * A wrapper namespace for common callbacks (aka Result Handlers).
 */
namespace Handlers {
    /**
     * When a given task has completed, this event handler used to notify
     * of the completion.
     *
     * @param key   The key associated with the task that has completed.
     * @param task  The above mentioned task.
     */
    export type TaskCompletionHandler = (key: string, task: ITask) => void

    /**
     * A Handler that notifies when a new task has been completed.
     *
     * @param task  The task object corresponding to the task that has been
     *              created.
     */
    export type TaskCreatedResult = (task: ITask) => void
}

export {
    Handlers
}
