![Front End Developer Desk](docs/img/header.png)


## Bonfire
Node job scheduling backed by Firebase RD.

###### STATUS

[![Build Status](https://travis-ci.org/Karn/bonfire.svg?branch=master)](https://travis-ci.org/Karn/bonfire)
[![Coverage Status](https://coveralls.io/repos/github/Karn/bonfire/badge.svg?branch=master)](https://coveralls.io/github/Karn/bonfire?branch=master)

###### FEATURES
- Scheduling a new job and automatic redundancy via Firebase.
- Cancelling existing jobs from job key.
- Requeuing existing jobs from a cold server start.


###### TABLE OF CONTENTS
- [Using Bonfire](docs/usage.md)
- [API Documentation](docs/api/documentation.md)
- [Contributing](.github/CONTRIBUTING.md)


###### GETTING STARTED
You can install Bonfire using Yarn or NPM. 

It is recommended that you use `--exact` as the library is constantly evolving and may break without notice.

```sh
# Via Yarn:
$ yarn add @karn/bonfire --exact
# or via NPM:
$ npm install @karn/bonfire --save-exact
```

```javascript
import { Bonfire } from '@karn/bonfire'
```
