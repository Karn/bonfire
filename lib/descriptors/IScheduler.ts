import { ITask } from './ITask';

export interface IScheduler {
    queueExisting(tasks: Array<ITask>): Promise<void>
    getPendingCount(): number
    get(key: string): Promise<ITask>
    schedule(task: ITask): Promise<ITask>
    cancel(key: string): Promise<void>
}
