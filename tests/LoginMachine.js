// LoginMachine.js
import StateMachine from '../src/StateMachine'
import Api from './Api'

const Machine = StateMachine('Init')

Machine.transition('Init', 'Load', m => {
    // first set the new state on the machine
    m.setState('GetSession')

    // send the api request
    Api.post('/get-session')
        .then(() => m.dispatch('OK')) // if successful, dispatch OK
        .catch(err => m.dispatch(err)) // if error, dispatch the error
})

Machine.transition('GetSession', 'OK', m => {
    m.setState('Done')
})

Machine.transition('GetSession', 'NotAuthorized', m => {
    m.setState('Form')
})

Machine.transition('Form', 'ChangeEmail', (m, email) => {
    m.model.email = email
})

Machine.transition('Form', 'ChangePassword', (m, password) => {
    m.model.password = password
})

Machine.transition('Form', 'Submit', m => {
    m.setState('Authenticate')

    Api.post('/authenticate', m.model)
        .then(() => m.dispatch('OK')) // if successful, dispatch OK
        .catch(err => m.dispatch(err)) // if error, dispatch the error
})

Machine.transition('Authenticate', 'OK', m => {
    m.setState('Done')
})

Machine.transition('Authenticate', 'NotAuthorized', m => {
    m.setState('Form')
})

export default Machine
