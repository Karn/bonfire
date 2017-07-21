import { expect } from 'chai'
import * as Mocha from 'mocha'
import { Bonfire, BonfireJob } from './../lib/Bonfire'

describe('BonfireJob Validation:', () => {

    describe('Instantiating a new BonfireJob object:', () => {
        it('should raise an error when a null or empty key is provided')
        it('should raise an error when a null or empty type is provided')
        it('should raise an error when a null date/time is provided')
    })

    describe('Instantiating a BonfireJob from a JSON object:', () => {
        it('should assign the key, type, and scheduled date')
        it('and also assign a payload if one is provided')
    })

})

describe('Bonfire Scheduler:', () => {

    describe('Creating a scheduler:', () => {
        it('should complete gracefully when a valid database ref is provided.')

        it('should raise an error when an invalid ref is provided.', () => {
            expect(() => {

                // Null is not a valid geofire ref.
                new Bonfire.Scheduler(null, (key: string, job: BonfireJob) => {
                    console.log('Processing job with key: ' + key)
                })
            }).to.throw()
        })

        it('should queue any jobs that already exist as children in the ref provided.')
    })

    describe('Looking up the root node ref:', () => {
        it('should return the same ref that is used to create the instance')
    })

    describe('Scheduling a job:', () => {
        it('should raise an error when a jobitem with an date/time in the past is provided')
        it('should return the existing job if the job already exists within the firebase RD')
        it('should create, queue and return the same BonfireJob if there was no existing key')
    })

    describe('Cancelling a job:', () => {
        it('should complete gracefully if the key does not exist.')
        it('remove an cancel an existing job when provided a key that exists')
    })

    describe('Job completion handler:', () => {
        it('should be invoked when a one-time job is executed')
    })
})
