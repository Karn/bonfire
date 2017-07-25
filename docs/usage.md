
## Using Bonfire
Start by providing a reference to the Firebase key within your Firebase Database. This will serve as the redundancy mechanism for the queued jobs. Additionally, a callback to process the completed jobs must be specified.

```javascript
// Import the Firebase Admin SDK
import * as Firebase from 'firebase-admin'
// Import the Bonfire library.
import { Bonfire } from '@karn/bonfire'

// Grab a reference to the node of your choosing. For this demo, we'll use the
// 'jobs' key at the root level.
let ref: Firebase.database.reference = Firebase.database().ref('jobs')

// Pass the newly extracted reference to the Bonfire object. This object can
// then be used as desired.
let jobScheduler: Bonfire.Scheduler = new Bonfire.Scheduler(ref, (key: String, job: Bonfire.Job) => {
    // Process completed events here.
    console.log('Completed job with key: ' + key)
})
```

Now you're probably wondering, how do I schedule my first job...? Well, it's actually quite simple.

```javascript
let job: Bonfire.Job = new Bonfire.Job(
    // Setting the key is important, it serves as the key/id of the job, and
    // will help as an identification mechaism.
    'test_key',
    // The type helps you figure out how to handle the job and parse its
    // payload.
    'TYPE_SIMPLE_JOB',
    // Last but not least, set the time at which the job will be executed.
    // In this case, it will be executed 60 seconds from the current time.
    new Date(Date.now() + 60000)
)

// Finally we schedule our job and wait for the magic to happen.
jobScheduler.schedule(job)
```

Shortly after you will see the following message in your console.
```
Completed job with key: test_key
```
