import {expect} from 'chai'
import {spawn} from 'child_process'
import join from '../src/join'

describe('join', () => {
  describe('on process that exits 0', () => {
    it('resolves after process exits', async () => {
      const child = spawn('node', ['-e', 'setTimeout(function () { process.exit(0) }, 50)'])
      let exited = false
      child.on('exit', () => exited = true)
      const result = await join(child)
      expect(exited).to.be.true
      expect(result.code).to.equal(0)
    })
  })
  describe('on process that exits 1', () => {
    it('rejects with exit code after process exits', async () => {
      const child = spawn('node', ['-e', 'setTimeout(function () { process.exit(1) }, 50)'])
      let exited = false
      let errored = false
      child.on('exit', () => exited = true)
      try {
        await join(child)
      } catch (error) {
        errored = true
        expect(exited).to.be.true
        expect(error.message).to.equal('process exited with code 1')
      }
      expect(errored).to.be.true
    })
  })
  describe('on process that exits with signal', () => {
    it('rejects with signal after process exits', async () => {
      const child = spawn('node', ['-e', 'setTimeout(function () { process.exit(0) }, 5000)'])
      let exited = false
      let errored = false
      child.on('exit', () => exited = true)
      const promise = join(child)
      child.kill('SIGINT')
      try {
        await promise
      } catch (error) {
        errored = true
        expect(exited).to.be.true
        expect(error.message).to.equal('process exited with signal SIGINT')
      }
      expect(errored).to.be.true
    })
  })
  describe("on process that doesn't exit in the given timeout", () => {
    it('rejects with Error after timeout is elapsed', async () => {
      const child = spawn('node', ['-e', 'setTimeout(function () { process.exit(0) }, 5000)'])
      let exited = false
      let errored = false
      child.on('exit', () => exited = true)
      let startTime = Date.now()
      try {
        await join(child, {timeout: 50})
      } catch (error) {
        errored = true
        expect(Date.now() - startTime).to.not.be.lessThan(50)
        expect(exited).to.be.false
        expect(error.message).to.equal('join timed out')
      } finally {
        child.kill()
      }
      expect(errored).to.be.true
    })
  })
})
