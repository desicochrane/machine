import Machine, { Transition, Dot } from '../Machine'

describe('Machine', () => {

    it('can create a new "Machine"', (done) => {
        const spec = {
            __start__: 'Editing',
            Editing: {
                update: Transition('Editing', (m, username) => {
                    m.data.username = username
                }),
                submit: Transition('Submitting', (m, ok) => {
                    m.data.err = null
                    setTimeout(() => {
                        if (!ok) {
                            m.err('Invalid')
                        } else {
                            m.ok()
                        }
                    })
                })
            },
            Submitting: {
                err: Transition('Editing', (m, err) => {
                    m.data.err = err
                }),
                ok: Transition('Success'),
            }
        }

        const m = Machine(spec, {
            username: '',
            err: null,
        })

        expect(m.state).toEqual('Editing')
        expect(m.data.username).toEqual('')
        expect(m.data.err).toEqual(null)

        m.update('Desio')

        expect(m.state).toEqual('Editing')
        expect(m.data.username).toEqual('Desio')
        expect(m.data.err).toEqual(null)

        m.submit(false)

        expect(m.state).toEqual('Submitting')
        expect(m.data.username).toEqual('Desio')
        expect(m.data.err).toEqual(null)

        setTimeout(() => {
            expect(m.state).toEqual('Editing')
            expect(m.data.username).toEqual('Desio')
            expect(m.data.err).toEqual('Invalid')

            m.submit(true)

            expect(m.state).toEqual('Submitting')
            expect(m.data.username).toEqual('Desio')
            expect(m.data.err).toEqual(null)

            setTimeout(() => {
                expect(m.state).toEqual('Success')
                expect(m.data.username).toEqual('Desio')
                expect(m.data.err).toEqual(null)

                done()
            }, 1)
        }, 1)
    })

    it('throws error on transition errors', () => {
        const m = Machine({
            __start__: Transition('Start')
        })

        let errorThrown = false
        try {
            m.boom()
        } catch(e) {
            errorThrown = true
        }

        expect(errorThrown).toEqual(true)
    })

    it('can be dotted', () => {
        const spec = {
            __start__: 'Off',
            Off: {
                click: Transition('On')
            },
            On: {
                click: Transition('Off')
            }
        }

        const dot = Dot(spec)

        expect(dot).toEqual(
`Digraph {
  "__start__" [shape=point]
  "__start__" -> Off

  "Off" -> "On" [label="click"]
  "On" -> "Off" [label="click"]
}`)
    })
})
