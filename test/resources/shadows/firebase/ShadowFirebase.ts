import * as Firebase from 'firebase-admin'
import * as Path from 'path'
import * as Sinon from 'sinon'

class ShadowFirebaseCredential implements Firebase.credential.Credential {
    getAccessToken(): Promise<Firebase.GoogleOAuthAccessToken> {
        return Promise.resolve({
            access_token: 'mock-token',
            expires_in: 3600,
        })
    }
}

class ShadowFirebase {

    public static readonly MOCK_APP_NAME: string = 'mock-app'
    public static readonly MOCK_DATABASE_URL: string = 'https://mockapp.firebaseio.com'

    private firebaseApp: Firebase.app.App

    constructor() {

        this.firebaseApp = Firebase.initializeApp({
            credential: new ShadowFirebaseCredential(),
            databaseURL: ShadowFirebase.MOCK_DATABASE_URL
        })

        this.firebaseApp.database().goOffline()
    }

    public database(): Firebase.database.Database {
        return this.firebaseApp.database()
    }
}

export {
    ShadowFirebase
}
