import { Errors } from '../utils/Errors'
import { ITask } from '../descriptors/ITask';

class Job implements ITask {

    public static readonly TASK_TAG: string = 'TASK_TAG_JOB'

    private key: string
    private type: string
    private scheduledDateTime: Date
    private payload: any

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
     * A key that uniquely identifies this object.
     * 
     * @return  Key/ID associated with this object.
     */
    public getKey(): string {
        return this.key
    }

    /**
     * Identifies the type of task represented by this class.
     * 
     * @return  A string identifying this Task.
     */
    public getTag(): string {
        return Job.TASK_TAG
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
     * Returns the time at which this job will be executed.
     * 
     * @return  A Date object representing the time of execution.
     */
    public getScheduledDateTime(): Date {
        return this.scheduledDateTime
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
     * Construct a JSON representation of this object; aids in the
     * 'serialization' when saving for redundancy.
     * 
     * @return  A JSON representation of this object.
     */
    public asJson(): any {
        let obj: any = {
            'id': this.key,
            'tag': this.getTag(),
            'type': this.type,
            'scheduled_date_time': this.scheduledDateTime.getTime()
        }

        // Return right away if there is no payload
        if (!this.payload) return obj

        // Attach payload if exists
        obj['payload'] = JSON.stringify(this.payload)
        return obj
    }
}

export {
    Job
}
