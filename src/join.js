// @flow

import type {ChildProcess} from 'child_process'

export type Result = {code: ?number, signal: ?string}

function join(child: ChildProcess, options?: {timeout?: number} = {}): Promise<Result> {
  const {timeout} = options
  return new Promise((_resolve: (result: Result) => void, _reject: (error: Error) => void) => {
    let timeoutId
    function unlisten() {
      child.removeAllListeners()
      if (timeoutId != null) clearTimeout(timeoutId)
    }
    function resolve(result: Result) {
      unlisten()
      _resolve(result)
    }
    function reject(error: Error) {
      unlisten()
      _reject(error)
    }
    child.on('exit', (code: ?number, signal: ?string): any => {
      if (code != null && code !== 0) reject(new Error(`process exited with code ${code}`))
      if (signal) reject(new Error(`process exited with signal ${signal}`))
      else resolve({code, signal})
    })
    child.on('error', reject)
    if (timeout) timeoutId = setTimeout((): any => reject(new Error('join timed out')), timeout)
  })
}

export default join
