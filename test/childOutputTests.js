import childStdout from '../src/childStdout'
import {expect} from 'chai'
import {spawn} from 'child_process'

describe('childStdout', () => {
  it('resolves to output matching regexp', async () => {
    const child = spawn('node', ['-e', `
    setTimeout(function () { console.log('testa') }, 25)
    setTimeout(function () { console.log('test2') }, 50)
    `])
    expect((await childStdout(child, /test\d/)).trim()).to.equal('test2')
  })
  it('resolves to output matching predicate', async () => {
    const child = spawn('node', ['-e', `
    setTimeout(function () { console.log('testa') }, 25)
    setTimeout(function () { console.log('test2') }, 50)
    `])
    expect((await childStdout(child, output => output.trim() === 'test2')).trim()).to.equal('test2')
  })
  it('rejects if child exits before output', async () => {
    const child = spawn('node', ['-e', `
    setTimeout(function () { console.log('testa') }, 25)
    setTimeout(function () { process.exit(0) }, 50)
    `])
    let error
    try {
      await childStdout(child, /test2/)
    } catch (e) {
      error = e
    }
    expect(error.message).to.match(/process exited/)
  })
  it('rejects if child closes before output', async () => {
    const child = spawn('node', ['-e', `
    setTimeout(function () { console.log('test2') }, 500)
    `])
    let error
    let promise = childStdout(child, /test2/).catch(e => error = e)
    // not sure how to close the streams without killing the process, so I'll just fake it...
    child.emit('close')
    await promise
    expect(error.message).to.match(/stream closed/)
  })
})
