// @flow

import type {ChildProcess} from 'child_process'
import type {Readable} from 'stream'

export default function childOutput(
  child: ChildProcess,
  stream: Readable,
  predicate: (output: string) => boolean | RegExp
): Promise<string> {
  return new Promise((_resolve: (data: string) => void, _reject: (error: Error) => void) => {
    function unlisten() {
      child.removeAllListeners()
      stream.removeListener('data', onData)
    }

    function resolve(data: string) {
      unlisten()
      _resolve(data)
    }

    function reject(error: Error) {
      unlisten()
      _reject(error)
    }

    function onData(data: Buffer) {
      const message = data.toString()
      if (predicate instanceof RegExp ? predicate.test(message) : predicate(message)) resolve(data.toString())
    }
    stream.on('data', onData)

    const onClose = () => reject(new Error('stream closed'))
    const onExit = () => reject(new Error('process exited'))
    child.on('error', reject)
    child.on('exit', onExit)
    child.on('close', onClose)
  })
}
