const events = require('events')
const ws = require('nodejs-websocket')

const defaultOptions = {
  port: 3000
}

const emitter = new events.EventEmitter()

const connectionCallback = conn => {
  // Send event to signal new connection
  emitter.emit('connection', conn)

  // Event when we get new data
  conn.on('text', rawInput => {
    try {
      const parsedInput = JSON.parse(rawInput)

      if (parsedInput.message != null) {
        // Pass on successfully parsed data to be handled
        emitter.emit(parsedInput.message, conn, parsedInput)
      }
    } catch (error) {
      // Pass on error information
      emitter.emit('error', error)
    }
  })

  // Handle connection closing
  conn.on('close', (code, reason) => {
    emitter.emit('disconnect', conn, { code, reason })
  })
}

module.exports = (options = defaultOptions) => {
  ws.createServer(connectionCallback).listen(options.port)

  return {
    on: (eventName, listener) => emitter.on(eventName, listener)
  }
}
