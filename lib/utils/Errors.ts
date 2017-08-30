/**
 * Error strings are detailed as constants here. Using constants allows for
 * consistent messages. Since no custom errors are used, the message must
 * provide appropriate context and data.
 */
class Errors {
    /* tslint:disable:max-line-length */
    public static readonly INVALID_ROOT_REFERENCE: string = 'Bonfire: Attempt to instantiate with invalid reference.'
    public static readonly SCHEDULED_IN_PAST: string = 'Cannot schedule a task to complete in a time that is the past.'
    public static readonly INVALID_TASK_KEY: string = 'Invalid Key provided.'
    public static readonly INVALID_TASK_TYPE: string = 'The task type must be a valid string and with a length greater than 0.'
    public static readonly INVALID_TASK_DATE: string = 'The task type must have a valid date.'

    // Exception messages.
    public static readonly TASK_ALREADY_EXISTS: string = 'Task with the same key already exists. The task cannot be created.'
    /* tslint:enable:max-line-length */
}

export {
    Errors
}
