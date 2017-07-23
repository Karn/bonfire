import * as Chai from 'chai'
import * as ChaiPromise from 'chai-as-promised'
import { Bonfire } from './../../lib/Index'
import * as Firebase from 'firebase-admin'
import { Errors } from '../../lib/utils/Errors'

describe('Bonfire Test Suite:', () => {

    Chai.use(ChaiPromise)
    const expect: Chai.ExpectStatic = Chai.expect

    beforeAll(() => {

    })

    describe('BonfireJob Validation:', () => {

        describe('Instantiating a new BonfireJob object:', () => {
            it('should raise an error when a null or empty key is provided', () => {

                // Validate a null key.
                expect(() => {
                    new Bonfire.Job(
                        null,
                        null,
                        null
                    )
                }).to.throw(Error, Errors.INVALID_JOB_KEY)

                // Validate an empty string
                expect(() => {
                    new Bonfire.Job(
                        '',
                        null,
                        null
                    )
                }).to.throw(Error, Errors.INVALID_JOB_KEY)
            })

            it('should raise an error when a null or empty type is provided', () => {

                // Validate a null type.
                expect(() => {
                    new Bonfire.Job(
                        'test_key',
                        null,
                        null
                    )
                }).to.throw(Error, Errors.INVALID_JOB_TYPE)

                // Validate a empty string.
                expect(() => {
                    new Bonfire.Job(
                        'test_key',
                        '',
                        null
                    )
                }).to.throw(Error, Errors.INVALID_JOB_TYPE)

            })
        })

        describe('Instantiating a BonfireJob from a JSON object:', () => {
            it('should assign the key, type, and scheduled date', () => {
                const date: number = new Date(Date.now() + 60000).getTime()

                const jobData: any = {
                    'id': 'test_key',
                    'type': 'TYPE_SIMPLE_JOB',
                    'scheduled_date_time': date
                }

                let job: Bonfire.Job = null

                expect(() => {
                    job = Bonfire.Job.fromJson(jobData)
                }).to.not.throw()

                expect(job).to.not.be.null

                expect(job.getKey()).to.equal('test_key')
                expect(job.getType()).to.equal('TYPE_SIMPLE_JOB')
                expect(job.getScheduledDateTime().getTime()).to.equal(date)
                expect(job.getPayload()).to.be.null
            })

            it('and also assign a payload if one is provided', () => {
                const date: number = new Date(Date.now() + 60000).getTime()

                const jobData: any = {
                    'id': 'test_key',
                    'type': 'TYPE_SIMPLE_JOB',
                    'scheduled_date_time': date,
                    'payload': {
                        'test': 'hello_world'
                    }
                }

                let job: Bonfire.Job = null

                expect(() => {
                    job = Bonfire.Job.fromJson(jobData)
                }).to.not.throw()

                expect(job).to.not.be.null

                expect(job.getKey()).to.equal('test_key')
                expect(job.getType()).to.equal('TYPE_SIMPLE_JOB')
                expect(job.getScheduledDateTime().getTime()).to.equal(date)
                expect(JSON.stringify(job.getPayload())).to.equal(JSON.stringify({
                    'test': 'hello_world'
                }))
            })
        })

    })

    describe('Bonfire Scheduler:', () => {

        describe('Creating a scheduler:', () => {
            it('should complete gracefully when a valid database ref is provided.')

            it('should raise an error when an invalid ref is provided.', () => {
                expect(() => {
                    // Null is not a valid geofire ref.
                    new Bonfire.Scheduler(null, (key: string, job: Bonfire.Job) => {
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
            it('remove and cancel an existing job when provided a key that exists')
        })

        describe('Job completion handler:', () => {
            it('should be invoked when a one-time job is executed')
        })
    })

})