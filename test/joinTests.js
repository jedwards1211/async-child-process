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
        expect(error.code).to.equal(1)
        expect(error.signal).to.be.null
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
        expect(error.code).to.be.null
        expect(error.signal).to.equal('SIGINT')
      }
      expect(errored).to.be.true
    })
  })
})
