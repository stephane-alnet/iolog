import { createServer } from 'node:http';
import { Server } from 'socket.io';

const port = 3000

const httpServer = createServer();
const io = new Server(httpServer, {
  // options
});

const log = (data) => {
  process.stdout.write(JSON.stringify(data) + '\n')
}

io.on("connection", (socket) => {
  log({
    level:'info',
    id: socket.id,
    serverTime: Date.now(),
    msg:'Connection'
  })
  const makeLogger = (level) => (meta,data,ack) => {
    log({
      level,
      id: socket.id,
      serverTime: Date.now(),
      ...meta,
      data: JSON.parse(data)
    })
    ack(true)
  }
  socket.on('log:info', makeLogger('info'))
  socket.on('log:debug', makeLogger('debug'))
  socket.on('log:warn', makeLogger('warn'))
  socket.on('log:error', makeLogger('error'))
});

httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
