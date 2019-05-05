export default function Machine(def, data) {
    const machine = { data, state: def.__start__ }

    Object.keys(def).filter(k => k !== '__start__').forEach(stateName => {
        Object.keys(def[stateName]).forEach(eventName => {
            machine[eventName] = (args) => {
                const {state, handler} = def[machine.state][eventName]
                machine.state = state
                return handler ? handler(machine, args) : Promise.resolve()
            }
        })
    })

    return machine
}

export const Transition = (state, handler) => ({state,handler})

export function Dot(def) {
    const seen = {}
    let result = ''

    function walk(stateName) {
        if (seen[stateName]) return
        seen[stateName] = true

        const stateObj = def[stateName] || {}
        Object.keys(stateObj).forEach(eventName => {
            result += `  "${stateName}" -> "${stateObj[eventName].state}" [label="${eventName}"]\n`
            walk(stateObj[eventName].state)
        })
    }
    walk(def.__start__)

    return `Digraph {\n  "__start__" [shape=point]\n  "__start__" -> ${def.__start__}\n\n${result}}`
}
