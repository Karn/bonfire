export class Job {

    private key: string
    private type: string
    private scheduledDateTime: Date
    private payload: any

    public constructor(scheduledDateTime: Date) {
        this.scheduledDateTime = scheduledDateTime
    }
}
