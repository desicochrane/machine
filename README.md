# Machine

[![Coverage Status](https://coveralls.io/repos/github/desicochrane/machine/badge.svg?branch=master&q=1)](https://coveralls.io/github/desicochrane/machine?branch=master)

Tiny dependency-free state-machine implementation in javascript.

## Get Started

### Basic:
1. `npm install @desicochrane/machine`
1. Define a new state machine specification
    ```js
    import Machine, { Transition } from '@desicochrane/machine'

    const spec = {
        __start__: 'off',
        off: {
            click: Transition('on'),
        },
        on: {
            click: Transition('off'),
        }
    }
    ```
1. Instantiate your machine with data:
    ```js
    const m = Machine(spec)
    ```
1. Use the machine
   ```js
   console.log(m.state) // "off"
   
   m.click()
   
   console.log(m.state) // "on"
   ```
1. Export to Dot file:
```
import { Dot } from  '@desicochrane/machine'
import fs from 'fs'

const dot = Dot(spec)

fs.writeFileSync('machine.dot', dot);
```
1. Optionally pass in data
    ```js
    import Machine, { Transition } from '@desicochrane/machine'

    const spec = {
        __start__: 'off',
        off: {
            click: Transition('on', (m, args) => {
                m.data.count += args
            }),
        },
        on: {
            click: Transition('off', (m, args) => {
                m.data.count -= args
            }),
        }
    }
    
    
    const m = Machine(spec, { count: 0 })
    
    m.click(3)
    console.log(m.data.count) // 3
    
    m.click(2)
    console.log(m.data.count) // 1
    ```

## Examples

[Example 1: Websocket Client](EXAMPLES.md#example1)

[Example 2: Login Form + Testing + VueJS](EXAMPLES.md#example2)
