# Machine   ![Open Source](https://cdn.rawgit.com/ellerbrock/open-source-badges/master/badges/open-source-v1/open-source.svg)

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


## Examples: 

1. [Websocket](./wiki/EXAMPLE1.md)
2. [Login Form + Testing + VueJS](./wiki/EXAMPLE2.md)
3. [Scaffolding](./wiki/SCAFFOLDING.md)
4. [Usage in Vue](./wiki/EXAMPLE-VUE.md)