import { Errors } from './../utils/Errors'
import { IRedundancyService } from './../descriptors/IRedundancyService'
import { ITask } from './../descriptors/ITask'
import { Job } from './../entities/Job'
import * as Firebase from 'firebase-admin'

/**
 * Provides an redundancy implementation that allows for Task data to be stored
 * using the Firebase Realtime Database.
 */
class FirebaseRedundancyService implements IRedundancyService {

    // A reference to the Firebase node at which the serialized tasks will
    // exist.
    private redundancyNodeReference: Firebase.database.Reference

    /**
     * Construct the FirebaseRS object which will provide redundancy for tasks
     * queued by the scheduler.
     *
     * @param reference A reference to the firebase node at which the Task data
     * is to be stored.
     */
    public constructor(reference: Firebase.database.Reference) {
        if (!reference) {
            throw new Error(Errors.INVALID_ROOT_REFERENCE)
        }

        this.redundancyNodeReference = reference
    }

    /**
     * Deserialize a JSON object into its corresponding task.
     *
     * @param data  The serialized data as a JSON object.
     * @return  A corresponding Task Implementation.
     */
    private deserialize(data: any): ITask {
        switch (data['type']) {
            case Job.TASK_TYPE:
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
        return this.redundancyNodeReference
    }

    /**
     * Fetch a list of all the tasks that are stored within the given firebase
     * node.
     *
     * @return  A Promise that resolves with a list of Tasks.
     *
     * @see IRedundancyService#getAll()
     */
    public async getAll(): Promise<Array<ITask>> {

        // Lookup the reference to the node in an attempt to queue jobs after
        // instantiation.
        const nodeSnapshot: Firebase.database.DataSnapshot =
            await this.redundancyNodeReference.once('value')

        // Ensure that the object exists.
        if (!nodeSnapshot.exists()) {
            // Job node does not exist. Nothin to do here.
            return null
        }

        // Create an empty array list to store teh tasks.
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

        // Return the list of tasks.
        return tasks
    }

    /**
     * Fetches Task from Firebase for a given key.
     *
     * @param key   The key that is being used to fetch the corresponding task.
     * @returns A Promise that resolves with the Task associated with the given
     *          key if it exists else resolves with null.
     *
     * @see IRedundancyService#fetch(string)
     */
    public async fetch(key: string): Promise<ITask> {
        // Fetch the value from firebase.
        const taskSnapshot: Firebase.database.DataSnapshot =
            await this.redundancyNodeReference.child(key).once('value')

        // Return null if the task does not exist.
        if (!taskSnapshot.exists()) {
            return null
        }

        // Deserialize the task to its representation.
        return this.deserialize(taskSnapshot.val())
    }

    /**
     * Serializes and stores a Task to Firebase.
     *
     * @param task  A Task that is being serialized and stored.
     * @return  A Promise that resolves once the operation is complete.
     *
     * @see IRedundancyService#commit(ITask)
     */
    public async commit(task: ITask): Promise<void> {
        // Set the value at the given key to the serialized version.
        await this.redundancyNodeReference
            .child(task.getKey())
            .set(task.asJson())

        return
    }

    /**
     * Remove a given Task from the redundancy store.
     *
     * @param key   The key that is used to identify the Task that is being
     *              removed.
     * @return  A promise that resolves once the operation is complete.
     *
     * @see IRedundancyService#remove(string)
     */
    public async remove(key: string): Promise<void> {
        // Remove the reference to the given task using its key.
        await this.redundancyNodeReference.child(key).remove()

        return
    }
}

export {
    FirebaseRedundancyService
}
