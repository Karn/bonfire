import { AdminRoot, constants as Constants } from 'firebase-admin-mock'
import * as Firebase from 'firebase-admin'

class ShadowFirebase {

    private admin: AdminRoot

    public constructor() {
        this.admin = new AdminRoot()

        this.admin.initializeApp({
            databaseUrl: Constants.DEFAULT_DATABASE_URL,
        })

        this.admin.database().setMockData({ foo: 'bar' })
    }

    public database(): Firebase.database.Database {
        return this.admin.database()
    }

}

export {
    ShadowFirebase
}
