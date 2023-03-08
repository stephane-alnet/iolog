import { io } from 'socket.io-client'
import fastSafeStringify from 'fast-safe-stringify'

// Default on browser and Node
let theGlobal = globalThis
// Browser-specific
if (!theGlobal) theGlobal = window
// Present on Node.js
if (!theGlobal) theGlobal = global

export const overrideConsole = ({push}) => {
  const makeLogger = (ev,orig) =>
    orig ? (...x) => { orig(...x); push(ev,x) } : (...x) => push(ev,x)

  if(!theGlobal.console) {
    theGlobal.console = {
      info: makeLogger('log:info'),
      log: makeLogger('log:info'),
      debug: makeLogger('log:debug'),
      warn: makeLogger('log:warn'),
      error: makeLogger('log:error'),
    }
    return true
  }

  theGlobal.console['log'] = makeLogger('log:info', theGlobal.console['log'])
  theGlobal.console['info'] = makeLogger('log:info', theGlobal.console['info'])
  theGlobal.console['debug'] = makeLogger('log:debug', theGlobal.console['debug'])
  theGlobal.console['warn'] = makeLogger('log:warn', theGlobal.console['warn'])
  theGlobal.console['error'] = makeLogger('log:error', theGlobal.console['error'])
}

export const start = (options = {}) => {
  const socket = io(options);

  const buffer = [];

  const flush = () => {
    if ( !socket.connected ) { return }
    if ( buffer.length <= 0 ) { return }
    const [ev,meta,data] = buffer[0]
    socket.emit(ev,meta,data, (response) => {
      if(response) {
        buffer.shift()
        flush()
      }
    })
  }

  socket.on('connect', flush )
  socket.on('reconnect', flush )

  const timer = setInterval(flush,100)

  return {
    push: (ev,x) => {
      const time = Date.now()
      const meta = { time }
      buffer.push([ev,meta,fastSafeStringify(x)])
      flush()
    },
    // Probably only needed on Node and in tests
    stop: () => {
      setTimeout( () => socket.close(), 200)
      clearInterval(timer)
    }
  }
}

if(theGlobal.window) {
  overrideConsole(start())
}
