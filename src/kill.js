// @flow

import type {ChildProcess} from 'child_process'

function kill(child: ChildProcess, signal?: string): Promise<void> {
  return new Promise((_resolve: () => void, _reject: (error: Error) => void) => {
    function resolve() {
      child.removeAllListeners()
      _resolve()
    }
    function reject(error: Error) {
      child.removeAllListeners()
      _reject(error)
    }
    child.on('exit', resolve)
    child.on('error', reject)
    if (signal) child.kill(signal)
    else child.kill()
  })
}

export default kill
