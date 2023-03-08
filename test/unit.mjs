import { overrideConsole, start } from '../src/client.mjs'
const iolog = start('http://localhost:3000')
overrideConsole(iolog)
console.log('hello world')
iolog.stop()
