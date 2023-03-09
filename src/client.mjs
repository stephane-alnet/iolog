import { overrideConsole, start, theGlobal } from './client-lib.mjs'

if(theGlobal.window) {
  overrideConsole(start())
}
