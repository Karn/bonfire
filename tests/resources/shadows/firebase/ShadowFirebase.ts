import { AdminRoot, defaultConfig as DefaultConfig } from 'firebase-admin-mock'
import * as Firebase from 'firebase-admin'

class ShadowFirebase {

    private admin: AdminRoot

    public constructor() {
        this.admin = new AdminRoot()

        this.admin.initializeApp(DefaultConfig)
    }

    public database(): Firebase.database.Database {
        return this.admin.database()
    }

}

export {
    ShadowFirebase
}
