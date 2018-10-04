```
## Usage in Vue

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