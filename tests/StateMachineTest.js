import { expect } from 'chai'
import StateMachine from '../StateMachine'

describe('StateMachine', () => {

    it('can create a new "StateMachine"', (done) => {
        const Model = {
            username: '',
            err: null,
        }

        const EvtEdit = 'Edit'
        const EvtSubmit = 'Submit'
        const EvtResponseOK = 'ResponseOK'
        const EvtResponseErr = 'ResponseErr'

        const EditState = 'EditState'
        const SubmitState = 'SubmitState'
        const SuccessState = 'SuccessState'

        const builder = StateMachine(EditState)

        builder.transition(EditState, EvtEdit, (sm, { username }) => {
            sm.model.username = username
        })

        builder.transition(EditState, EvtSubmit, (sm, { fail }) => {
            sm.model.err = null

            sm.setState(SubmitState)

            setTimeout(() => {
                if (fail === true) {
                    sm.dispatch(EvtResponseErr, { err: 'Invalid' })
                } else {
                    sm.dispatch(EvtResponseOK)
                }
            }, 1)
        })

        builder.transition(SubmitState, EvtResponseOK, (sm) => {
            sm.setState(SuccessState)
        })

        builder.transition(SubmitState, EvtResponseErr, (sm, { err }) => {
            sm.model.err = err
            sm.setState(EditState)
        })

        const machine = builder.start(Model)

        expect(machine.inState(EditState)).to.be.true
        expect(machine.state).to.equal(EditState)
        expect(machine.model.username).to.equal('')
        expect(machine.model.err).to.equal(null)

        machine.dispatch(EvtEdit, { username: 'Desio' })

        expect(machine.state).to.equal(EditState)
        expect(machine.model.username).to.equal('Desio')
        expect(machine.model.err).to.equal(null)

        machine.dispatch(EvtSubmit, { fail: true })

        expect(machine.state).to.equal(SubmitState)
        expect(machine.model.username).to.equal('Desio')
        expect(machine.model.err).to.equal(null)

        setTimeout(() => {
            expect(machine.state).to.equal(EditState)
            expect(machine.model.username).to.equal('Desio')
            expect(machine.model.err).to.equal('Invalid')

            machine.dispatch(EvtSubmit, { fail: false })

            expect(machine.state).to.equal(SubmitState)
            expect(machine.model.username).to.equal('Desio')
            expect(machine.model.err).to.equal(null)

            setTimeout(() => {
                expect(machine.state).to.equal(SuccessState)
                expect(machine.model.username).to.equal('Desio')
                expect(machine.model.err).to.equal(null)

                done()
            }, 1)
        }, 1)
    })

    it('disallows duplicate transition definitions', () => {
        const M = StateMachine('start')

        // given there is already a start:event transition defined
        M.transition('start', 'event', () => {})

        // when we try to define another
        let errorThrown = false
        try {
            M.transition('start', 'event', () => {})
        } catch(e) {
            errorThrown = true
        }

        // then an error should be thrown
        expect(errorThrown).equals(true)
    })
})
