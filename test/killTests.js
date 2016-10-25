import {expect, assert} from 'chai'
import {spawn} from 'child_process'
import kill from '../src/kill'

describe('kill', () => {
  describe('without extra arguments', () => {
    it('sends SIGTERM and waits until process has exited', async () => {
      const child = spawn('node', ['-e', 'setTimeout(function () { process.exit(0) }, 50)'])
      let signal
      child.on('exit', (code, _signal) => signal = _signal)
      await kill(child)
      expect(signal).to.equal('SIGTERM')
    })
  })
  describe('with signal argument', () => {
    it('sends signal and waits until process has exited', async () => {
      const child = spawn('node', ['-e', 'setTimeout(function () { process.exit(0) }, 50)'], {stdio: 'inherit'})
      let signal
      child.on('exit', (code, _signal) => signal = _signal)
      await kill(child, 'SIGINT')
      expect(signal).to.equal('SIGINT')
    })
  })
  describe("with process that can't be spawned", () => {
    it('rejects with error event', async () => {
      const child = spawn('blarghhh')
      try {
        await kill(child, 'SIGINT')
        assert.fail("should have rejected")
      } catch (error) {
        // ignore
      }
    })
  })
})
