export interface ITask {
    getKey(): string
    getType(): string
    getTag(): string
    getScheduledDateTime(): Date
    getPayload(): any
    asJson(): any
}
