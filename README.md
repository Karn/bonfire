## Bonfire
Node job scheduling backed by Firebase RD.

###### GETTING STARTED
You can install Bonfire using Yarn or NPM.

```sh
# Via Yarn:
$ yarn add @karn/bonfire --save
# or via NPM:
$ npm install @karn/bonfire --save
```

```javascript
import { Bonfire } from '@karn/bonfire'
```


###### USING BONFIRE
Start by providing a reference to the Firebase key within your Firebase Database which will serve as the redundancy mechanism for the queued jobs.

```javascript
// Import the Firebase Admin SDK
import * as Firebase from 'firebase-admin'
// Import the Bonfire library.
import { Bonfire } from '@karn/bonfire'

// Grab a reference to the node of your choosing. For this demo, we'll use the 'jobs' key at the root level.
let jobNodeRef: Firebase.database.reference = Firebase.database().ref('jobs')
// Pass the newly extracted reference to the Bonfire object. This object can then be used as desired.
let jobScheduler: Bonfire = new Bonfire(jobNodeRef)
```
