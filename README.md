# machine


# Example: Login State Machine

### The state machine
<img src="docs/login.dot.svg">

### The screens


### Start from the tests

```js
// LoginMachineTest.js
import { expect } from 'chai'
import Machine from './LoginMachine'

describe('LoginMachine', () => {
    it('starts in INIT state', () => {
        // start a new instance of the machine
        const m = Machine.start()
        
        // assert the initial state is 'init'
         expect(m.state).equal('Init')
    })
})
```

We can make it pass by:

```js
// LoginMachine.js
import StateMachine from 'machine'

// Create a new state machine with 'init' as initial state
const Machine = StateMachine('Init')

export default Machine
```

Great. Looking at our state machine diagram then, we can see the valid only transition from Init state is the "Load" event.
This is fired when the app has loaded and ready to start. When this occurs, we want to send an api request to our backend endpoint '/get-session' to see if we are already logged in. We write up a test to reflect this directly:

```js
// LoginMachineTest.js
import sinon from 'sinon'

const sandbox = sinon.createSandbox()

describe('Init', () => {
    afterEach(sandbox.restore)

    it('Load', () => {
        // Given we are in the Init state
        const m = Machine.start()

        // and that our backend api is mocked
        const api = sandbox.stub(Api, 'post').returns(Promise.defer().promise)

        // When the 'Load' event is dispatched
        m.dispatch('Load')

        // Then we should be in the 'GetSession' state
        expect(m.state).equal('GetSession')

        // And an api request to '/get-session' should have been called
        sinon.assert.calledWith(api, '/get-session')
    })
})
```

If we run this test we should get the error: `Error: transition Init:Load not defined`. This points us in the right direction.

```js
// LoginMachine.js

Machine.transition('Init', 'Load', m => {
    // first set the new state on the machine
    m.setState('GetSession')

    // send the api request
    Api.post('/get-session')
        .then(() => m.dispatch('OK')) // if successful, dispatch OK
        .catch(err => m.dispatch(err)) // if error, dispatch the error
})
```

A transition definition takes a State, Event, and Callback as arguments. The Callback takes as argument an instance of the machine itself, and any data passed along with the Event.

Next we can look at the 'GetSession' state, it needs to handle both the 'OK' and 'NotAuthorized' events
```js
// LoginMachineTest.js

describe('GetSession', () => {

    it('OK', () => {
        const m = Machine.start()
        m.setState('GetSession')

        m.dispatch('OK')

        expect(m.state).equal('Done')
    })

    it('NotAuthorized', () => {
        const m = Machine.start()
        m.setState('GetSession')

        m.dispatch('NotAuthorized')

        expect(m.state).equal('Form')
    })
})
```

We should now see `Error: transition GetSession:OK not defined` and `Error: transition GetSession:NotAuthorized not defined`

```js
// LoginMachine.js
Machine.transition('GetSession', 'OK', m => {
    m.setState('Done')
})

Machine.transition('GetSession', 'NotAuthorized', m => {
    m.setState('Form')
})
```

Next, we can write our test for the 'Form' state:

```js
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
})
```

Making that pass:

```js
Machine.transition('Form', 'ChangeEmail', (m, email) => {
    m.model.email = email
})

Machine.transition('Form', 'ChangePassword', (m, password) => {
    m.model.password = password
})
```

And then we can submit the form:

```js
describe('Form', () => {
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
```

making it pass, we can (notice we use model on the machine here):

```js
Machine.transition('Form', 'Submit', m => {
    m.setState('Authenticate')

    Api.post('/authenticate', m.model)
        .then(() => m.dispatch('OK')) // if successful, dispatch OK
        .catch(err => m.dispatch(err)) // if error, dispatch the error
})
```

Finally:

```js
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
```

```js
Machine.transition('Authenticate', 'OK', m => m.setState('Done'))
Machine.transition('Authenticate', 'NotAuthorized', m => m.setState('Form'))
```



