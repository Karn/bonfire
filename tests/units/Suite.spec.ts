import * as Chai from 'chai'
import * as ChaiPromise from 'chai-as-promised'
import { Bonfire } from './../../lib/Index'
import * as Firebase from 'firebase-admin'
import { Errors } from './../../lib/utils/Errors'
import { ShadowFirebase } from './../resources/shadows/firebase/ShadowFirebase'
import { expect } from 'chai';

describe('Bonfire Test Suite:', () => {

    Chai.use(ChaiPromise)
    const expect: Chai.ExpectStatic = Chai.expect

    beforeAll(async () => {
        const FirebaseApp = new ShadowFirebase()
        this.ShadowFirebase = FirebaseApp
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
                expect(job.getPayload()).to.be.undefined
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
            it('should complete gracefully when a valid database ref is provided.', () => {
                const FirebaseApp: ShadowFirebase = this.ShadowFirebase

                new Bonfire.Scheduler(FirebaseApp.database().ref('jobs'), (key: string, job: Bonfire.Job) => { })
            })

            it('should raise an error when an invalid ref is provided.', () => {
                expect(() => {
                    // Null is not a valid geofire ref.
                    new Bonfire.Scheduler(null, (key: string, job: Bonfire.Job) => { })
                }).to.throw()
            })

            it('should queue any jobs that already exist as children in the ref provided.', async (done) => {

                const FirebaseApp: ShadowFirebase = this.ShadowFirebase

                await FirebaseApp.database().ref('jobs').set({
                    'test_key': {
                        'id': 'test_key_1',
                        'type': 'TYPE_SIMPLE_JOB',
                        'scheduled_date_time': new Date(Date.now() + 360000).getTime()
                    }
                }, () => { })

                const scheduler: Bonfire.Scheduler = new Bonfire.Scheduler(FirebaseApp.database().ref('jobs'), (key: string, job: Bonfire.Job) => { })

                await new Promise<any>(resolve => setTimeout(resolve, 2000))

                done()
            })
        })

        describe('Looking up the root node ref:', () => {
            it('should return the same ref that is used to create the instance', () => {

                const FirebaseApp: ShadowFirebase = this.ShadowFirebase

                const ref: Firebase.database.Reference = FirebaseApp.database().ref('jobs')

                const scheduler: Bonfire.Scheduler = new Bonfire.Scheduler(FirebaseApp.database().ref('jobs'), (key: string, job: Bonfire.Job) => { })

                expect(scheduler.getRef().toString()).to.equal(ref.toString())
            })
        })

        describe('Scheduling a job:', () => {
            beforeEach(() => {
                const FirebaseApp: ShadowFirebase = new ShadowFirebase()
                this.ShadowFirebase = FirebaseApp
                this.Scheduler = new Bonfire.Scheduler(FirebaseApp.database().ref('jobs'), (key: string, job: Bonfire.Job) => { })
            })

            it('should raise an error when a jobitem with an date/time in the past is provided', () => {
                const FirebaseApp: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = this.Scheduler

                return expect(Scheduler.schedule(new Bonfire.Job(
                    'test_key',
                    'TYPE_SIMPLE_JOB',
                    new Date(Date.now() - 360000)
                ))).to.eventually.be.rejectedWith(Errors.SCHEDULED_IN_PAST)
            })
            it('should create, queue and return the same BonfireJob if there was no existing key', async () => {
                const FirebaseApp: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = this.Scheduler

                const job: Bonfire.Job = new Bonfire.Job(
                    'test_key_1',
                    'TYPE_SIMPLE_JOB',
                    new Date(Date.now() + 360000)
                )

                expect(Scheduler.getPendingJobCount()).to.equal(0)

                let jobRes: Bonfire.Job = await Scheduler.schedule(job)

                expect(jobRes).to.equal(job)

                expect(Scheduler.getPendingJobCount()).to.equal(1)
            })
            it('should return the existing job if the job already exists within the firebase RD', async () => {
                const FirebaseApp: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = this.Scheduler

                const job: Bonfire.Job = new Bonfire.Job(
                    'test_key_1',
                    'TYPE_SIMPLE_JOB',
                    new Date(Date.now() + 360000)
                )

                const jobTwo: Bonfire.Job = new Bonfire.Job(
                    'test_key_1',
                    'TYPE_SIMPLE_JOB',
                    new Date(Date.now() + 720000)
                )

                expect(Scheduler.getPendingJobCount()).to.equal(0)

                let jobRes: Bonfire.Job = await Scheduler.schedule(job)
                expect(jobRes).to.equal(job)
                expect(Scheduler.getPendingJobCount()).to.equal(1)

                let jobResTwo: Bonfire.Job = await Scheduler.schedule(jobTwo)
                expect(jobResTwo).to.not.equal(jobTwo)
                expect(Scheduler.getPendingJobCount()).to.equal(1)
            })
        })

        describe('Cancelling a job:', () => {

            beforeEach(() => {
                const FirebaseApp: ShadowFirebase = new ShadowFirebase()
                this.ShadowFirebase = FirebaseApp
                this.Scheduler = new Bonfire.Scheduler(FirebaseApp.database().ref('jobs'), (key: string, job: Bonfire.Job) => { })
            })

            it('should complete gracefully if the key does not exist.', () => {
                const FirebaseApp: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = this.Scheduler

                return expect(Scheduler.cancel('test_key')).to.eventually.be.fulfilled
            })
            it('remove and cancel an existing job when provided a key that exists', async () => {
                const FirebaseApp: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = this.Scheduler

                const job: Bonfire.Job = new Bonfire.Job(
                    'test_key',
                    'TYPE_SIMPLE_JOB',
                    new Date(Date.now() + 360000)
                )

                expect(Scheduler.getPendingJobCount()).to.equal(0)

                let jobRes: Bonfire.Job = await Scheduler.schedule(job)

                expect(jobRes).to.equal(job)

                expect(Scheduler.getPendingJobCount()).to.equal(1)

                await Scheduler.cancel('test_key')

                expect(Scheduler.getPendingJobCount()).to.equal(0)
            })
        })

        describe('Job completion handler:', () => {
            beforeEach(() => {
                const FirebaseApp: ShadowFirebase = new ShadowFirebase()
                this.ShadowFirebase = FirebaseApp
            })

            it('should be invoked when a one-time job is executed', async () => {

                const queue: Array<string> = new Array<string>()

                const FirebaseApp: ShadowFirebase = this.ShadowFirebase
                const Scheduler: Bonfire.Scheduler = new Bonfire.Scheduler(FirebaseApp.database().ref('jobs'), (key: string, job: Bonfire.Job) => {
                    queue.push(key)
                })

                expect(queue).to.have.length(0)

                await Scheduler.schedule(new Bonfire.Job(
                    'test_key',
                    'TYPE_SIMPLE_JOB',
                    new Date(Date.now() + 1000)
                ))

                await new Promise<any>(resolve => setTimeout(resolve, 2000))

                expect(queue).to.have.length(1)
                expect(queue[0]).to.equal('test_key')
            })
        })
    })

})
