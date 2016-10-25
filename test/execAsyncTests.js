import {expect, assert} from 'chai'
import execAsync from '../src/execAsync'

describe('execAsync', () => {
  describe('on process that exits 0', () => {
    it('resolves with output after process exits', async () => {
      const {stdout, stderr} = await execAsync(
        `node -e 'console.log("test1"); console.error("test2"); setTimeout(function () { process.exit(0) }, 50)'`
      )
      expect(stdout.trim()).to.equal('test1')
      expect(stderr.trim()).to.equal('test2')
    })
  })
  describe('on process that exits 1', () => {
    it('rejects with exit code after process exits', async () => {
      try {
        await execAsync(`node -e 'setTimeout(function () { process.exit(1) }, 50)'`)
        assert.fail("should have rejected")
      } catch (error) {
        expect(error.code).to.equal(1)
        expect(error.signal).to.be.null
      }
    })
  })
  describe('on process that exits with signal', () => {
    it('rejects with signal after process exits', async () => {
      try {
        await execAsync(`node -e 'setTimeout(function () { process.kill(process.pid, "SIGINT") }, 50)'`)
        assert.fail("should have rejected")
      } catch (error) {
        expect(error.code).to.be.null
        expect(error.signal).to.equal('SIGINT')
      }
    })
  })
})
