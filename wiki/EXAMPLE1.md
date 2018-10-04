## Examples 1: Websocket

Consider implementing a wrapper around a browser websocket connection. Your API might support starting and stopping the websocket connection, handling reconnects when there is an unexpected disconnect, and handling sending and recieving messages when the connection is open.

We can visualise how it should work with the following state machine:

<img src="docs/websocket.svg" style="display: block; width: 300px; margin: 0 auto;">

The machine is initially in the `Stopped` state. We specify this when we create our state machine:
```js
// WebsocketMachine.js
import StateMachine from './StateMachine'

const WebsocketMachine = StateMachine('Stopped')
```

This demonstrates how the StateMachine function is used to bootstrap a new state machine. The function takes as first argument an enum to set the initial state, and an optional second argument which is a callback for when there is an error. 

From the `Stopped` state there is only the `Start` transition event, which we can specify:
```js
// WebsocketMachine.js
import StateMachine from './StateMachine'

const WebsocketMachine = StateMachine('Stopped')

WebsocketMachine.transition('Stopped', 'Start', (m, data) => {
    m.setState('Connecting')
    // todo: bootstrap new ws connection
})
```

This example demonstrates the `transition` method, which takes three arguments:
1. A *State* enum
2. An *Event* enum
3. A callback function which is called when that event is fired from that state. 

The callback function itself takes two arguments:
1. The state machine instance itself
2. (Optional) any data passed along with the event.

The state machine instance supports two methods:
1. `m.setState(state)` which is used to change the state of the state machine
2. `m.dispatch(event, data)` which is used to dispatch an event with optionally any data

To illustrate how dispatching events works, we can next implement the bootstrapping of the websocket connection:

```js
// WebsocketMachine.js
import StateMachine from './StateMachine'

const WebsocketMachine = StateMachine('Stopped')

WebsocketMachine.transition('Stopped', 'Start', (m, data) => {
    m.setState('Connecting')
    bootstrapWSConnection(m)
})

function bootstrapWSConnection(m) {
    // create a new websocket connection
    const conn = new WebSocket('wss://app.com')

    // proxy each websocket event to our own dispatcher
    conn.onopen = () => m.dispatch('ConnOpen')
    conn.onclose = () => m.dispatch('ConnClosed')
    conn.onmessage = msg => m.dispatch('Msg', msg)

    ws.model.conn = conn
}
```

Here you can see we added a helper function `bootstrapWSConnection` which creates a new websocket connection and proxies all of its events to the machine's own dispatcher. Notice that we only pass data along with the `Msg` event. Finally we save the connection onto the `model` property of the machine, which is a special property for the state machine instance to save its own model data.

We can implement the rest of our state machine in the same way to arrive at the final result:

```js
import StateMachine from './StateMachine'

const WebsocketMachine = StateMachine('Stopped')

// Stopped
WebsocketMachine.transition('Stopped', 'Start', m => {
    m.setState('Connecting')
    bootstrapWSConnection(m)
})

// Connecting
WebsocketMachine.transition('Connecting', 'ConnOpen', m => {
    m.setState('Connected')
})
WebsocketMachine.transition('Connecting', 'ConnClosed', m => {
    m.setState('Disconnected')
    setTimeout(() => m.dispatch('Retry'), 1000)
})

// Connected
WebsocketMachine.transition('Connected', 'Stop', (m, data) => {
    m.setState('Stopping')
    m.model.conn.close()
    m.model.conn = null
})
WebsocketMachine.transition('Connected', 'ConnClosed', m => {
    m.setState('Disconnected')
    setTimeout(() => m.dispatch('Retry'), 1000)
})
WebsocketMachine.transition('Connected', 'Message', (m, data) => {
    m.model.onMessage(data)
})

// Disconnected
WebsocketMachine.transition('Disconnected', 'Retry', m => {
    m.setState('Connecting')
    bootstrapWSConnection(m)
})
WebsocketMachine.transition('Disconnected', 'Stop', m => {
    m.setState('Stopped')
})

// Stopping
WebsocketMachine.transition('Stopping', 'ConnClosed', m => {
    m.setState('Stopped')
})

export default WebsocketMachine
```

Now that we are done scaffolding our state machine, we can use it:

```js
// app.js
import WebsocketMachine from './WebsocketMachine'

const model = {
    onMessage(msg) {
        console.log(msg)
    }
}

const ws = WebsocketMachine.start(model)
```

This illustrates the `start` method, which returns a new instance of the state machine. It takes as argument a model which can be mutated and accessed internally by the state machine - in this case it provides a callback to be used when there is a websocket message arriving.
```