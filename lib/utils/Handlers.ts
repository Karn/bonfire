import { Job } from './../model/Job'

export namespace Handlers {

    export type JobCompletionHandler = (key: string, job: Job) => void
    export type JobCreatedResult = (job: Job) => void
    export type ErrorResult = (error: Error) => void
}
