import * as Firebase from 'firebase-admin'
import * as NodeSchedule from 'node-schedule'
import { Utils } from './misc/Utils';

export default class Bonfire {

    /**
     * Maintains a list of local jobs.
     */
    public jobList: Map<string, NodeSchedule.Job>

    private bonfireRef: Firebase.database.Reference

    public constructor(reference: Firebase.database.Reference) {
        if (!reference) {
            throw new Error('Bonfire: Attempt to instantiate with invalid reference.')
        }

        // Store the Firebase Reference so that it can be used at a later time.
        this.bonfireRef = reference

        this.jobList = new Map<string, NodeSchedule.Job>()
    }

    /**
     * Firebase reference that was used to create this `Bonfire` instance.
     */
    public getRef(): Firebase.database.Reference {
        return this.bonfireRef
    }
}

