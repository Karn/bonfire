class Errors {
    public static readonly INVALID_ROOT_REFERENCE = 'Bonfire: Attempt to instantiate with invalid reference.'
    public static readonly SCHEDULED_IN_PAST = 'Cannot schedule a job to complete in a time that is the past.'
    public static readonly INVALID_JOB_KEY = 'Invalid Key provided.'
    public static readonly INVALID_JOB_TYPE = 'The job type must be a valid string and with a length greater than 0.'
}

export {
    Errors
}
