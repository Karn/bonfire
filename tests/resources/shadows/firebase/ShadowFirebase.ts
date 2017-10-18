import { AdminRoot, defaultConfig as DefaultConfig } from 'firebase-admin-mock'
import * as Firebase from 'firebase-admin'

/**
 * A shadow class of the firebase-admin library object.
 * Builds a singleton instance of the firebase-admin library with default
 * configurations.
 */
class ShadowFirebase {

    private admin: AdminRoot

    public constructor() {
        this.admin = new AdminRoot()

        this.admin.initializeApp(DefaultConfig)
    }

    /**
     * Return the instantiated database object.
     */
    public database(): Firebase.database.Database {
        return this.admin.database()
    }

}

export {
    ShadowFirebase
}
