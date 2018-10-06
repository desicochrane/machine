export default function(startState, onError) {
    const stateFns = {}

    function start(model, logger = () => {}) {
        const machine = { state: null, model, setState, inState, dispatch }

        function err(msg) {
            if (onError) return onError(machine, msg)
            throw Error(msg)
        }

        function inState() {
            return !!Array.from(arguments).find(state => machine.state === state)
        }

        function dispatch(event, data) {
            logger(`dispatch: ${machine.state}:${event}`, data)

            const events = stateFns[machine.state]
            if (!events) return err(`transition ${machine.state}:${event} not defined`)

            const fn = stateFns[machine.state][event]
            if (!fn) return err(`transition ${machine.state}:${event} not defined`)

            fn(machine, data)
        }

        function setState(state) {
            logger(`transition: ${machine.state} -> ${state}`)
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

    return { start, transition }
}
