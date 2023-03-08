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
  let running = true;

  const flush = () => {
    if ( !socket.connected ) {
      if ( running ) {
        setTimeout( flush, 500 )
      }
      return
    }
    if ( buffer.length <= 0 ) { return }
    const rec = buffer.shift()
    const [ev,meta,data] = rec
    try {
      socket.emit(ev,meta,data, (response) => {
        if(!response) {
          buffer.unshift(rec)
        }
        flush()
      })
    } catch {
      buffer.unshift(rec)
    }
  }

  socket.on('connect', flush )
  socket.on('reconnect', flush )

  return {
    push: (ev,x) => {
      const time = Date.now()
      const meta = { time }
      buffer.push([ev,meta,fastSafeStringify(x)])
      flush()
    },
    // Probably only needed on Node and in tests
    stop: () => {
      running = false
      setTimeout( () => socket.close(), 500)
    }
  }
}

if(theGlobal.window) {
  overrideConsole(start())
}
