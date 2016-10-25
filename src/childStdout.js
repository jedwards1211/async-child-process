// @flow

import childOutput from './childOutput'

import type {ChildProcess} from 'child_process'

export default function childStdout(
  child: ChildProcess,
  predicate: (stdout: string) => boolean | RegExp
): Promise<string> {
  return childOutput(child, child.stdout, predicate)
}
