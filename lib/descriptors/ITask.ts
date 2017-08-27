/**
 * Provides a skeleton for a Task; All operations must be fully
 * implemented.
 */
interface ITask {

    /**
     * A key that uniquely identifies a given Task.
     * 
     * @return  A unique key associated with this Task.
     */
    getKey(): string

    /**
     * The type represents the mapping that is used to distinguish between the
     * type to Task objects. This is what is used to properly deserialize the
     * right task.
     * 
     * @return  A string that identifies the type of Task.
     */
    getType(): string

    /**
     * Any additionaly sub-category is provided by this value.
     * 
     * @return  A string that may identify any sub-type of this Task.
     */
    getTag(): string

    /**
     * Contains the Date/Time for execution of this Task.
     * 
     * @return  A Date object representing the Date/Time of exectution.
     */
    getScheduledDateTime(): Date

    /**
     * Contains a larger set of JSON data associated with the task.
     * 
     * @return  A JSON object containing any additional data associated with
     *          this Task.
     */
    getPayload(): any

    /**
     * Serializes the entirety of the data into a JSON object.
     * 
     * @return  The Task as a JSON object.
     */
    asJson(): any
}

export {
    ITask
}
