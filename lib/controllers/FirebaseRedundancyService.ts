import { IRedundancyService } from './../descriptors/IRedundancyService'
import * as Firebase from 'firebase-admin'
import { ITask } from './../descriptors/ITask'
import { Errors } from './../utils/Errors'
import { Job } from '../entities/Job'

class FirebaseRedundancyService implements IRedundancyService {

    private redundancyReference: Firebase.database.Reference

    public constructor(reference: Firebase.database.Reference) {
        if (!reference) {
            throw new Error(Errors.INVALID_ROOT_REFERENCE)
        }

        this.redundancyReference = reference
    }

    /**
     * Deserialize a JSON object into its corresponding task.
     * 
     * @param data  The serialized data as a JSON object.
     * @return  A corresponding Task Implementation.
     */
    private deserialize(data: any): ITask {
        switch (data['tag']) {
            case Job.TASK_TAG:
                return Job.fromJson(data)
            default:
                return null
        }
    }

    /**
     * Return the reference node associated with the redundancy mechanism.
     * 
     * @return  A Firebase Reference to the node which contains Task data.
     */
    public getRef(): Firebase.database.Reference {
        return this.redundancyReference
    }

    public async getAll(): Promise<Array<ITask>> {

        // Lookup the reference to the node in an attempt to queue jobs after
        // instantiation.
        const nodeSnapshot: Firebase.database.DataSnapshot =
            await this.redundancyReference.once('value')

        // Ensure that the object exists.
        if (!nodeSnapshot.exists()) {
            // Job node does not exist. Nothin to do here.
            return null
        }

        const tasks: Array<ITask> = new Array<ITask>()

        // Iterate through the jobs and requeue as neccessart.
        nodeSnapshot.forEach((jobSnapshot: Firebase.database.DataSnapshot) => {

            // Ensure that the object exists.
            if (!jobSnapshot.exists()) {
                // Job does not exist. Nothin to do here.
                return false
            }

            // Deserialize and add to the list of tasks.
            tasks.push(this.deserialize(jobSnapshot.val()))

            // Returning true exits from the iterator.
            return false
        })

        return tasks
    }

    /**
     * Fetches Task from Firebase for a given key.
     * 
     * @see IRedundancyService#fetch(string)
     */
    public async fetch(key: string): Promise<ITask> {
        // Fetch the value from firebase.
        const taskSnapshot: Firebase.database.DataSnapshot =
            await this.redundancyReference.child(key).once('value')

        // Return null if the task does not exist.
        if (!taskSnapshot.exists()) {
            return null
        }

        return this.deserialize(taskSnapshot.val())
    }

    /**
     * Serializes and stores a task to Firebase.
     * 
     * @see IRedundancyService#commit(string)
     */
    public async commit(task: ITask): Promise<void> {
        // Set the value at the given key to the serialized version.
        await this.redundancyReference
            .child(task.getKey())
            .set(task.asJson())

        return
    }

    public async remove(key: string): Promise<void> {
        // Remove the reference to the given task using its key.
        await this.redundancyReference.child(key).remove()

        return
    }
}

export {
    FirebaseRedundancyService
}
