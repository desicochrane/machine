## Scaffolding:

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