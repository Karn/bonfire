import { AdminRoot, constants as Constants } from 'firebase-admin-mock'
import * as Firebase from 'firebase-admin'

class ShadowFirebase {

    private admin: AdminRoot

    public constructor() {
        this.admin = new AdminRoot()

        this.admin.initializeApp({
            databaseUrl: Constants.DEFAULT_DATABASE_URL,
        })

        this.admin.database().setMockData({ jobs: 'jobs' })

        // try {
        //     this.admin.database()
        //         .ref('jobs')
        //         .on('child_added', (dataSnapshot: Firebase.database.DataSnapshot) => {
        //             console.log(dataSnapshot.ref.toString())
        //             console.log(dataSnapshot.val())
        //         })
        // } catch (error) {
        //     console.log('Error' + error.message)
        // }
    }

    public database(): Firebase.database.Database {
        return this.admin.database()
    }

}

export {
    ShadowFirebase
}
