import { ITask } from '../descriptors/ITask'

export namespace Handlers {

    export type JobCompletionHandler = (key: string, job: ITask) => void
    export type JobCreatedResult = (job: ITask) => void
    export type ErrorResult = (error: Error) => void
}
