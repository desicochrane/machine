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

    it('Handles Login Success', () => {
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
