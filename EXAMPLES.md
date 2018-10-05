## <a name="example1"></a>Example 1: Websocket

Consider implementing a wrapper around a browser websocket connection. Your API might support starting and stopping the websocket connection, handling reconnects when there is an unexpected disconnect, and handling sending and recieving messages when the connection is open.

We can visualise how it should work with the following state machine:

<img src="docs/websocket.svg" style="display: block; width: 300px; margin: 0 auto;">

The machine is initially in the `Stopped` state. We specify this when we create our state machine:
```js
// WebsocketMachine.js
import MachineBuilder from '@desicochrane/machine'

const WebsocketMachine = MachineBuilder('Stopped')
```

This demonstrates how the StateMachine function is used to bootstrap a new state machine. The function takes as first argument an enum to set the initial state, and an optional second argument which is a callback for when there is an error. 

From the `Stopped` state there is only the `Start` transition event, which we can specify:
```js
// WebsocketMachine.js
import Machine from '@desicochrane/machine'

const WebsocketMachine = Machine('Stopped')

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
import Machine from '@desicochrane/machine'

const WebsocketMachine = Machine('Stopped')

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
import Machine from '@desicochrane/machine'

const WebsocketMachine = Machine('Stopped')

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

## <a name="example2"></a>Example 2: Login Form + Testing + VueJS

Consider next implementing a login form. This login form should redirect immediately to the dashboard if the user is already logged in, otherwise it should show the email and password form. Once on the form, the user can change the email and passowrd before submitting the form, if they are authorized then they should be redirected to the dashboard.

Based on these requirements we can construct the following state machine:


<img src="docs/login.dot.svg">


#### Testing

The state machine is delightfully easy to unit test and usually goes in 3 steps:

1. Setup the test with an initial state and initial model data
2. Dispatch an event
3. Assert final state and model data.

One convention is to structure your tests with `describe(state)` and `it(event)`. A full unit test suite then might be as follows:

```js
// LoginMachineTest.js

import { expect } from 'chai'
import sinon from 'sinon'
import Machine from './LoginMachine'
import Api from './Api'

const sandbox = sinon.createSandbox()

describe('LoginMachine', () => {
    afterEach(sandbox.restore)

    it('starts in INIT state', () => {
        // start a new instance of the machine
        const m = Machine.start()

        // expect the initial state is 'init'
        expect(m.state).equals('Init')
    })

    describe('Init', () => {

        it('Load', () => {
            // Given we are in the Init state
            const m = Machine.start()

            // and that our backend api is mocked
            const api = sandbox.stub(Api, 'post')
            api.returns(Promise.defer().promise)

            // When the 'Load' event is dispatched
            m.dispatch('Load')

            // Then we should be in the 'GetSession' state
            expect(m.state).equals('GetSession')

            // And an api request to '/get-session' should have been called
            sinon.assert.calledWith(api, '/get-session')
        })
    })

    describe('GetSession', () => {

        it('OK', () => {
            const m = Machine.start()
            m.setState('GetSession')

            m.dispatch('OK')

            expect(m.state).equals('Done')
        })

        it('NotAuthorized', () => {
            const m = Machine.start()
            m.setState('GetSession')

            m.dispatch('NotAuthorized')

            expect(m.state).equals('Form')
        })
    })

    describe('Form', () => {

        it('ChangeEmail,ChangePassword', () => {
            // Given our initial model
            const model = {
                email: '',
                password: '',
            }
            const m = Machine.start(model)

            // And that we are in the 'Form' state
            m.setState('Form')

            // When the ChangeEmail event is dispatched with an email
            m.dispatch('ChangeEmail', 'hello@des.io')

            // Then we should remain in the Form state
            expect(m.state).equals('Form')

            // And our model should have the updated email
            expect(model.email).equals('hello@des.io')

            // When the ChangePassword event is dispatched with a password
            m.dispatch('ChangePassword', 'abc123')

            // Then we should remain in the Form state
            expect(m.state).equals('Form')

            // And our model should have the updated email
            expect(model.password).equals('abc123')
        })

        it('Submit', () => {
            // Given our initial model
            const model = {
                email: 'hell@des.io',
                password: 'abc123',
            }
            const m = Machine.start(model)

            // and that our backend api is mocked
            const api = sandbox.stub(Api, 'post')
            api.returns(Promise.defer().promise)

            // And that we are in the 'Form' state
            m.setState('Form')

            // When the Submit event is fired
            m.dispatch('Submit')

            // Then we should be in the Authenticate state
            expect(m.state).equals('Authenticate')

            // And an api request to '/authenticate' should have been called with the form data
            sinon.assert.calledWith(api, '/authenticate', {
                email: 'hell@des.io',
                password: 'abc123',
            })
        })
    })
    
    describe('Authenticate', () => {
    
        it('OK', () => {
            const m = Machine.start()
            m.setState('Authenticate')

            m.dispatch('OK')

            expect(m.state).equals('Done')
        })

        it('NotAuthorized', () => {
            const m = Machine.start()
            m.setState('Authenticate')

            m.dispatch('NotAuthorized')

            expect(m.state).equals('Form')
        })
    })
})
```

### Scaffolding:

We can scaffold the login state machine as follows:

```js
// LoginMachine.js
import StateMachine from '../src/StateMachine'
import Api from './Api'

export const States = {
    Init: 'Init',
    GetSession: 'GetSession',
    Form: 'Form',
    Authenticate: 'Authenticate',
    Done: 'Done',
}

export const Events = {
    Load: 'Load',
    OK: 'OK',
    ChangeEmail: 'ChangeEmail',
    ChangePassword: 'ChangePassword',
    Submit: 'Submit',
}

export const Errors = {
    Unexpected: 'Unexpected',
    NotAuthorized: 'NotAuthorized',
}

export function NewModel() {
    return {
        email: '',
        password: '',
    }
}

const Machine = StateMachine(States.Init, (m, err) => {
    m.setState(Errors.Unexpected)
    throw Error(err)
})

Machine.transition(States.Init, Events.Load, m => {
    m.setState(States.GetSession)

    Api.post('/get-session')
        .then(() => m.dispatch(Events.OK))
        .catch(err => m.dispatch(err))
})

Machine.transition(States.GetSession, Events.OK, m => {
    m.setState(States.Done)
})
Machine.transition(States.GetSession, Errors.NotAuthorized, m => {
    m.setState(States.Form)
})

Machine.transition(States.Form, Events.ChangeEmail, (m, email) => {
    m.model.email = email
})
Machine.transition(States.Form, Events.ChangePassword, (m, password) => {
    m.model.password = password
})
Machine.transition(States.Form, Events.Submit, m => {
    m.setState(States.Authenticate)

    Api.post('/authenticate', m.model)
        .then(() => m.dispatch(Events.OK))
        .catch(err => m.dispatch(err))
})

Machine.transition(States.Authenticate, Events.OK, m => {
    m.setState(States.Done)
})
Machine.transition(States.Authenticate, Errors.NotAuthorized, m => {
    m.setState(States.Form)
})

export default Machine

```

### Usage in Vue

```js
import LoginMachine, { States, Events, Errors, NewModel } from './LoginMachine'

const m = LoginMachine.start(NewModel(), { logging: true })

new Vue({
    data: { m },
    mounted: () => m.dispatch(Events.Load),
    computed: {
        err: () => m.inState(Errors.Unexpected),
        showInit: () => m.inState(States.Init, States.GetSession),
        showForm: () => m.inState(States.Form, States.Authenticate),
        showDashboard: () => m.inState(States.Done),
        isSubmitting: () => m.inState(States.Authenticate),
    },
    methods: {
        changeEmail: email => m.dispatch(Events.ChangeEmail, email),
        changePassword: password => m.dispatch(Events.ChangePassword, password),
        submit: () => m.dispatch(Events.Submit),
    },
    template: `
<div>
  <div v-if="err">Whoops! Something went wrong.</div>

  <div v-if="showInit">Loading...</div>

  <div v-if="showDashboard">Welcome to Dashboard</div>

  <div v-if="showForm">
    <div>Log in</div>

    <form @submit.prevent="submit">
      <input @input="evt => changeEmail(evt.target.value)"
             :value="m.model.email"
             :disabled="isSubmitting"
             placeholder="Email">

      <input type="password"
             @input="evt => changePassword(evt.target.value)"
             :value="m.model.password"
             :disabled="isSubmitting"
             placeholder="password">

      <button type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting">Logging in...</span>
        <span v-else>Log in</span>
      </button>
    </form>
  </div>
</div>       
    `
})
```



