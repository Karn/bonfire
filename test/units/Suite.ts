import * as Chai from 'chai'
import * as ChaiPromise from 'chai-as-promised'
import * as Mocha from 'mocha'
import { Bonfire } from './../../lib/Index'
import * as Firebase from 'firebase-admin'
import { ShadowFirebase } from './../resources/shadows/firebase/ShadowFirebase'
import { Errors } from '../../lib/utils/Errors'

describe('Bonfire Test Suite:', () => {

    Chai.use(ChaiPromise)
    const expect: Chai.ExpectStatic = Chai.expect

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

        before(() => {
            // Create an instance of the Shadow Firebase object which allows for objects to be mocked.
            this.ShadowFirebase = new ShadowFirebase()
        })

        describe('Creating a scheduler:', () => {
            it('should complete gracefully when a valid database ref is provided.', () => {

                const ShadowFirebase: ShadowFirebase = this.ShadowFirebase

                expect(() => {
                    // Null is not a valid geofire ref.
                    new Bonfire.Scheduler(ShadowFirebase.database().ref('jobs'), (key: string, job: Bonfire.Job) => {
                        console.log('Processing job with key: ' + key)
                    })
                }).not.to.throw()
            })

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
            it('should return the same ref that is used to create the instance', () => {

                const ShadowFirebase: ShadowFirebase = this.ShadowFirebase

                let ref: Firebase.database.Reference = ShadowFirebase.database().ref('jobs')

                const jobScheduler: Bonfire.Scheduler = new Bonfire.Scheduler(ref, (key: string, job: Bonfire.Job) => {
                    console.log('Processing job with key: ' + key)
                })

                expect(jobScheduler.getRef()).to.equal(ref)
            })
        })

        describe('Scheduling a job:', () => {

            before(() => {
                const ShadowFirebase: ShadowFirebase = this.ShadowFirebase

                // Create a single jobScheduler object.
                this.Scheduler = new Bonfire.Scheduler(ShadowFirebase.database().ref('jobs'), (key: string, job: Bonfire.Job) => {
                    console.log('Processing job with key: ' + key)
                })
            })

            it('should raise an error when a jobitem with an date/time in the past is provided', () => {

                const ShadowFirebase: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = this.Scheduler

                return expect(Scheduler.schedule(new Bonfire.Job(
                    'test_key',
                    'TYPE_SIMPLE_JOB',
                    new Date(Date.now() - 360000)
                ))).to.eventually.be.rejectedWith(Error, Errors.SCHEDULED_IN_PAST)
            })

            it('should return the existing job if the job already exists within the firebase RD')
            it('should create, queue and return the same BonfireJob if there was no existing key')
        })

        describe('Cancelling a job:', () => {

            before(() => {
                const ShadowFirebase: ShadowFirebase = this.ShadowFirebase

                // Create a single jobScheduler object.
                this.Scheduler = new Bonfire.Scheduler(ShadowFirebase.database().ref('jobs'), (key: string, job: Bonfire.Job) => {
                    console.log('Processing job with key: ' + key)
                })
            })

            it('should complete gracefully if the key does not exist.', () => {
                const ShadowFirebase: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = this.Scheduler

                expect(Scheduler.getPendingJobKeys().length).to.equal(0)

                return expect(Scheduler.cancel('test_key')).to.be.fulfilled
            })

            it('remove and cancel an existing job when provided a key that exists')
        })

        describe('Job completion handler:', () => {
            it('should be invoked when a one-time job is executed')
        })
    })

})
