## Code Style

###### IMPORTS
If possible import only the required modules, if not possible, you may use the wildcard import.

```javascript
import { Module } from 'package'

import { module as Module } from 'package'

import * as Module from 'package'

import { Module } from './path/to/local-pacakge-or-module'
```

Imports are organized in alphabetical order by assigned module name, when renaming modules in imports we order by the new name.

When importing multiple modules from a package, sort them alphabetically.

```javascript
import { A, B, C, Z } from 'package' 
```
