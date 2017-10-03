![Logo](./docs/img/header.png)


## Bonfire
Simple Node scheduling backed by Firebase RD.

###### STATUS

[![Build Status](https://travis-ci.org/Karn/bonfire.svg?branch=master)](https://travis-ci.org/Karn/bonfire)

###### FEATURES
- Scheduling a new job and automatic redundancy via Firebase.
- Cancelling existing jobs from job key.
- Requeuing existing jobs from a cold server start.


###### QUICK LINKS
- [Using Bonfire](./docs/usage.md)
- [API Documentation](./docs/api/documentation.md)
- [Contributing](./.github/CONTRIBUTING.md)


###### GETTING STARTED
You can install Bonfire using Yarn or NPM. 

It is recommended that you use `--exact` as the library is constantly evolving and may break without notice.

```sh
# Via Yarn:
$ yarn add bonfire --exact
# or via NPM:
$ npm install bonfire --save-exact
```

```javascript
import { Bonfire } from 'bonfire'
```

###### CONTRIBUTING
There are many ways to [contribute](./.github/CONTRIBUTING.md) to Bonfire, you can:
- submit bugs,
- help track issues,
- review code changes,
- or, engage in discussion about new features.