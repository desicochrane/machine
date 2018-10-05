# machine

[![Coverage Status](https://coveralls.io/repos/github/desicochrane/machine/badge.svg?branch=master)](https://coveralls.io/github/desicochrane/machine?branch=master)

Minimal, tiny, zero-dependency state-machine implementation in javascript.

## Get Started

1. `npm install @desicochrane/machine`
1. Define a new state machine with a starting state and error function:
    ```js
    const machine = StateMachine('off', (m, err) => {
        console.log(err)
    })
    ```
1. Define a transition via `machine.transition(state, event, callback)` :
    ```js
    machine.transition('off', 'switchOn', (m, data) => {
        m.setState('on')
        m.model.counter += data
    }) 
    
    machine.transition('on', 'switchOff', (m) => {
        m.setState('off')
    })
    
    machine.transition('on', 'switchOn')
    ```
1. Instantiate your machine:
    ```js
    const m = machine.start({ counter: 0 })
    ```
1. Dispatch events
   ```js
   m.dispatch('switchOn', 1)
   m.dispatch('switchOn', 10)
   m.dispatch('switchOff')
   m.dispatch('switchOn', 2)
   
   console.log(m.model.counter) // 3
   
   m.dispatch('switchOff')
   m.dispatch('switchOff') // error: transition off:switchOff not defined
   ```


## Examples

[Example 1: Websocket Client](EXAMPLES.md#example1)

[Example 2: Login Form + Testing + VueJS](EXAMPLES.md#example2)
