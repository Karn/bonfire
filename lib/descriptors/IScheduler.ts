import { ITask } from './ITask';

export interface IScheduler {
    queueExisting(): Promise<void>
    get(key: string): Promise<ITask>
    schedule(task: ITask): Promise<ITask>
    cancel(key: string): Promise<void>
}
