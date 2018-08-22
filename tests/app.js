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
})
