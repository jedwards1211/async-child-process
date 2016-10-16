// @flow

import type {ChildProcess} from 'child_process'

type Options = {
  timeout?: number,
}

function kill(child: ChildProcess): Promise<void> {
  const signal: ?string = typeof arguments[1] === 'string' ? arguments[1] : undefined
  const options: Options = arguments[arguments.length - 1] instanceof Object
    ? arguments[arguments.length - 1]
    : {}
  const {timeout} = options

  return new Promise((_resolve: () => void, _reject: (error: Error) => void) => {
    let timeoutId
    function unlisten() {
      child.removeAllListeners()
      if (timeoutId != null) clearTimeout(timeoutId)
    }
    function resolve() {
      unlisten()
      _resolve()
    }
    function reject(error: Error) {
      unlisten()
      _reject(error)
    }
    child.on('exit', resolve)
    child.on('error', reject)
    if (timeout) timeoutId = setTimeout(() => reject(new Error('kill timed out')), timeout)
    if (signal) child.kill(signal)
    else child.kill()
  })
}

export default kill
