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
Start by providing a reference to the Firebase key within your Firebase Database which will serve as the redundancy mechanism for the queued jobs. Additionally, a callback to process the completed jobs must be specified.

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
let jobScheduler: Bonfire = new Bonfire(ref, (key: String, job: BonfireJob) => {
    // Process completed events here.
    console.log('Completed job with key: ' + key)
})
```

Now you're probably wondering, how do i schedule my first job? Its actually quite simple.
```javascript
let job: BonfireJob = new BonfireJob()

// Setting the key is important, it serves as the key/id of the job, and will
// help as an identification mechaism.
job.setKey('test_key') 

// The type helps you figure out how to handle the job and parse its payload.
job.setType('TYPE_SIMPLE_JOB')

// Last but not least, the time at which the job will be executed. In this case, it will be executed 60 seconds from the current time.
job.setScheduledDateTime(new Date(Date.now() + 60000))

// Finally we schedule our job and wait for the magic to happen.
jobScheduler.schedule(job)
```

Shortly after you will see the following message in your console.
```
Completed job with key: test_key
```

###### TODO
- Autogenerate keys for jobs without keys.
- Back to the future -- Handle timestamps from the past.
