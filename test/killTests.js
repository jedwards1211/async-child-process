import {expect} from 'chai'
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
  describe('with timeout', () => {
    it('rejects when timeout elapses before process exits', async function () {
      this.timeout(30000)
      const child = spawn('node', [require.resolve('./util/killTimeoutChild')], {stdio: [0, 1, 2, 'ipc']})
      let signal, error
      child.on('exit', (code, _signal) => signal = _signal)
      await new Promise(resolve => child.on('message', resolve))
      try {
        await kill(child, 'SIGINT', {timeout: 50})
      } catch (_error) {
        error = _error
      }
      try {
        expect(signal).to.be.undefined
        expect(error.message).to.equal('kill timed out')
      } finally {
        child.kill()
      }
    })
  })
})
