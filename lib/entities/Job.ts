import { Errors } from './../utils/Errors'
import { ITask } from './../descriptors/ITask'

/**
 * A simple implementation of the Task interface. Provides a one-time firing
 * Task.
 */
class Job implements ITask {

    // Identifies the type of this Task.
    public static readonly TASK_TYPE: string = 'TASK_TYPE_JOB'

    private key: string
    private tag: string
    private scheduledDateTime: Date
    private payload: any

    /**
     * Create the basic components of a Job.
     *
     * @param key       A unique key to identify this job.
     * @param tag       The type used to catagorize this job.
     * @param datatime  The time at which this job will execute as a Date
     *                  object.
     */
    public constructor(key: string, tag: string, datetime: Date) {

        if (!key || key.length === 0) {
            throw new Error(Errors.INVALID_JOB_KEY)
        }

        if (!tag || tag.length === 0) {
            throw new Error(Errors.INVALID_JOB_TYPE)
        }

        this.key = key
        this.tag = tag
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
        return this.tag
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
        return Job.TASK_TYPE
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
    public setPayload(payload: any): void {
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

        // Create the initial job.
        const job: Job = new Job(
            data['id'],
            data['tag'],
            new Date(data['scheduled_date_time'])
        )

        // Append payload data if it exists.
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

        // Construct the json representation.
        const obj: any = {
            'id': this.key,
            'type': this.getType(),
            'tag': this.tag,
            'scheduled_date_time': this.scheduledDateTime.getTime()
        }

        // Return right away if there is no payload
        if (!this.payload) {
            return obj
        }

        // Attach payload if exists
        obj['payload'] = JSON.stringify(this.payload)
        return obj
    }
}

export {
    Job
}
