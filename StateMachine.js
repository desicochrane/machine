export default function(startState, onError) {
    const stateFns = {}

    function start(model, config = {}) {
        const logging = config.logging === true

        const machine = {
            model,
            state: null,
            setState,
            inState,
            dispatch,
        }

        function err(msg) {
            if (onError) {
                onError(machine, msg)
            } else {
                throw Error(msg)
            }
        }

        function inState() {
            return Array.from(arguments).find(state => model.state === state)
        }

        function dispatch(event, data) {
            if (machine.state === null) {
                err(`no start state set`)
            }

            if (logging) console.log(`dispatch: ${machine.state}:${event}`, data)

            const events = stateFns[machine.state]
            if (!events) {
                err(`transition ${machine.state}:${event} not defined`)
            }

            const fn = stateFns[machine.state][event]
            if (!fn) {
                err(`transition ${machine.state}:${event} not defined`)
            }

            fn(machine, data)
        }

        function setState(state) {
            if (logging) console.log(`transition: ${machine.state} -> ${state}`)

            machine.state = state
        }

        setState(startState)

        return machine
    }

    function transition(state, event, fn) {
        if (!stateFns[state]) stateFns[state] = {}

        if (stateFns[state][event]) {
            throw new Error(`transition ${state}:${event} already defined`)
        }

        stateFns[state][event] = fn
    }

    return {
        start,
        transition,
    }
}
