// @flow

import childOutput from './childOutput'

import type {ChildProcess} from 'child_process'

export default function childStderr(
  child: ChildProcess,
  predicate: (stdout: string) => boolean | RegExp,
  options?: {timeout?: number}
): Promise<string> {
  return childOutput(child, child.stderr, predicate, options)
}
