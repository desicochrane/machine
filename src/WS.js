import StateMachine from './StateMachine'

const WebsocketMachine = StateMachine('Stopped')

// Stopped
WebsocketMachine.transition('Stopped', 'Start', m => {
    m.setState('Connecting')
    bootstrapWSConnection(m)
})

// Connecting
WebsocketMachine.transition('Connecting', 'ConnOpen', m => {
    m.setState('Connected')
})
WebsocketMachine.transition('Connecting', 'ConnClosed', m => {
    m.setState('Disconnected')
    setTimeout(() => m.dispatch('Retry'), 1000)
})

// Connected
WebsocketMachine.transition('Connected', 'Stop', (m, data) => {
    m.setState('Stopping')
    m.model.conn.close()
    m.model.conn = null
})
WebsocketMachine.transition('Connected', 'ConnClosed', m => {
    m.setState('Disconnected')
    setTimeout(() => m.dispatch('Retry'), 1000)
})
WebsocketMachine.transition('Connected', 'Message', (m, data) => {
    m.model.onMessage(data)
})

// Disconnected
WebsocketMachine.transition('Disconnected', 'Retry', m => {
    m.setState('Connecting')
    bootstrapWSConnection(m)
})
WebsocketMachine.transition('Disconnected', 'Stop', m => {
    m.setState('Stopped')
})

// Stopping
WebsocketMachine.transition('Stopping', 'ConnClosed', m => {
    m.setState('Stopped')
})


function bootstrapWSConnection(m) {
    const conn = new WebSocket('wss://app.com')

    conn.onopen = () => m.dispatch('ConnOpen')
    conn.onclose = () => m.dispatch('ConnClosed')
    conn.onmessage = msg => m.dispatch('Msg', msg)

    ws.model.conn = conn
}

export default WebsocketMachine
