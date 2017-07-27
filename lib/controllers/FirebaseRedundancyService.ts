import { IRedundancyService } from './../descriptors/IRedundancyService'
import * as Firebase from 'firebase-admin'
import { ITask } from './../descriptors/ITask'
import { Errors } from './../utils/Errors'
import { Job } from '../entities/Job';

class FirebaseRedundancyService implements IRedundancyService {

    private redundancyReference: Firebase.database.Reference

    public constructor(reference: Firebase.database.Reference) {
        if (!reference) {
            throw new Error(Errors.INVALID_ROOT_REFERENCE)
        }

        this.redundancyReference = reference
    }

    /**
     * Return the reference node associated with the redundancy mechanism.
     * 
     * @return  A Firebase Reference to the node which contains Task data.
     */
    public getRef(): Firebase.database.Reference {
        return this.redundancyReference
    }

    /**
     * Fetches Task from Firebase for a given key.
     * 
     * @see IRedundancyService#fetch(string)
     */
    public async fetch(key: string): Promise<ITask> {
        // Fetch the value from firebase.
        let taskSnapshot: Firebase.database.DataSnapshot
        taskSnapshot = await this.redundancyReference.child(key).once('value')

        // Return null if the task does not exist.
        if (!taskSnapshot.exists()) {
            return null
        }

        // Convert to JSON to process tag
        let taskData: any = taskSnapshot.val()

        switch (taskData['tag']) {
            case Job.TASK_TAG:
                return Job.fromJson(taskData)
            default:
                return null
        }
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
