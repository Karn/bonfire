import { IScheduler } from './../descriptors/IScheduler'
import * as Firebase from 'firebase-admin'
import { FirebaseRedundancyService } from './FirebaseRedundancyService'
import * as NodeSchedule from 'node-schedule'

class Scheduler implements IScheduler {

    /**
     * Maintains a list of local jobs.
     */
    private jobList: Map<string, NodeSchedule.Job>

    private redundancyService: FirebaseRedundancyService

    public constructor(reference: Firebase.database.Reference) {
        // Attach the redundancy service
        this.redundancyService = new FirebaseRedundancyService(reference)
    }

    public async get(key: string): Promise<ITask> {
        throw new Error("Method not implemented.");
    }
    public async schedule(task: ITask): Promise<ITask> {
        throw new Error("Method not implemented.");
    }
    public async cancel(key: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

export {
    Scheduler
}
