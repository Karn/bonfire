import { Errors } from '../utils/Errors'

export class Job {

    private key: string = null
    private type: string = null
    private scheduledDateTime: Date = null
    private payload: any = null

    /**
     * Create the basic components of a Job.
     * 
     * @param key       A unique key to identify this job.
     * @param type      The type used to catagorize this job.
     * @param datatime  The time at which this job will execute as a Date
     *                  object.
     */
    public constructor(key: string, type: string, datetime: Date) {

        if (!key || key.length == 0) {
            throw new Error(Errors.INVALID_JOB_KEY)
        }

        if (!type || type.length == 0) {
            throw new Error(Errors.INVALID_JOB_TYPE)
        }

        this.key = key
        this.type = type
        this.scheduledDateTime = datetime
    }

    /**
     * Construct a BonfireJob object from a JSON object.
     * 
     * @param data  Key-value pairs representing fields that can be mapped to a
     *              job.
     * @return  A BonfireJob object corresponding to the JSON object provided. 
     */
    public static fromJson(data: any): Job {
        let job: Job = new Job(
            data['id'],
            data['type'],
            new Date(data['scheduled_date_time'])
        )

        if (data['payload']) {
            job.setPayload(data['payload'])
        }

        return job
    }

    /**
     * A key that uniquely identifies this object.
     * 
     * @return  Key/ID associated with this object.
     */
    public getKey(): string {
        return this.key
    }

    /**
     * Set/update key that uniquely identifies this object.
     * 
     * @param key   A string that will be used as the Key/ID for this object.
     */
    public setKey(key: string) {
        this.key = key
    }

    /**
     * Return the type of this Job. This is particularily useful for instances
     * where you have specific categories of actions, e.g a job with type 
     * DELETE_SESSION, using this value you could delegate a task to perfom a
     * session delete from within the jobCompletionHandler.
     * 
     * @return  The type of job described by this object.
     */
    public getType(): string {
        return this.type
    }

    /**
     * Set/update the type of job described by this object.
     * 
     * @param type  A string representation of the type.
     */
    public setType(type: string): void {
        this.type = type
    }

    /**
     * Returns the time at which this job will be executed.
     * 
     * @return  A Date object representing the time of execution.
     */
    public getScheduledDateTime(): Date {
        return this.scheduledDateTime
    }

    /**
     * Set/update the time at which this job will be executed.
     * 
     * @param date  The time of execution as a Date object.
     */
    public setScheduledDateTime(date: Date): void {
        this.scheduledDateTime = date
    }

    /**
     * Returns the payload associated with this object.
     * 
     * @return  The payload as a JSON object.
     */
    public getPayload(): any {
        return this.payload
    }

    /**
     * Set/update the payload associated with this object.
     * 
     * @param payload   The payload as a JSON object.
     */
    public setPayload(payload: any) {
        this.payload = payload
    }

    /**
     * Construct a JSON representation of this object; aids in the
     * 'serialization' when saving for redundancy.
     * 
     * @return  A JSON representation of this object.
     */
    public asJson(): any {
        let obj: any = {
            'id': this.key,
            'type': this.type,
            'scheduled_date_time': this.scheduledDateTime.getTime()
        }

        if (this.payload) {
            obj['payload'] = JSON.stringify(this.payload)
        }

        return obj
    }
}
