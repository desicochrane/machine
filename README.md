# Machine   

[![Coverage Status](https://coveralls.io/repos/github/desicochrane/machine/badge.svg?branch=master)](https://coveralls.io/github/desicochrane/machine?branch=master)

Tiny dependency-free state-machine implementation in javascript.

## Get Started

1. `npm install @desicochrane/machine`
1. Define a new state machine with a starting state
    ```js
    import Machine from '@desicochrane/machine'

    const MyMachine = Machine('off')
    ```
1. Define a transition via `machine.transition(state, event, callback)` :
    ```js
    MyMachine.transition('off', 'switchOn', (m, data) => {
        m.setState('on')
        m.model.counter += data
    }) 
    
    MyMachine.transition('on', 'switchOff', (m) => {
        m.setState('off')
    })
    
    MyMachine.transition('on', 'switchOn')
    ```
1. Instantiate your machine with your model:
    ```js
    const model = { counter: 0 }
    const m = MyMachine.start(model)
    ```
1. Dispatch events
   ```js
   m.dispatch('switchOn', 1)
   m.dispatch('switchOn', 10)
   m.dispatch('switchOff')
   m.dispatch('switchOn', 2)
   
   console.log(model.counter) // 3
   ```


## Examples

[Example 1: Websocket Client](EXAMPLES.md#example1)

[Example 2: Login Form + Testing + VueJS](EXAMPLES.md#example2)
