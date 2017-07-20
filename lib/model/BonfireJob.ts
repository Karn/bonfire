import { Utils } from '../misc/Utils'

export class BonfireJob {

    private key: string
    private type: string
    private scheduledDateTime: Date

    public constructor() {
    }

    public static fromJson(data: any): BonfireJob {
        let job: BonfireJob = new BonfireJob()

        job.setKey(data['id'])
        job.setType(data['type'])
        // TODO: This needs to be converted from millis to a date.
        job.setScheduledDateTime(new Date(data['scheduled_date_time']))

        return job
    }

    public getKey(): string {
        return this.key
    }

    public setKey(key: string) {
        this.key = key
    }

    public getType(): string {
        return this.type
    }

    public setType(type: string): void {
        this.type = type
    }

    public getScheduledDateTime(): Date {
        return this.scheduledDateTime
    }

    public setScheduledDateTime(date: Date): void {
        this.scheduledDateTime = date
    }

    public asJson(): any {
        return {
            'id': this.key,
            'type': this.type,
            'scheduled_date_time': this.scheduledDateTime.getTime()
        }
    }
}
