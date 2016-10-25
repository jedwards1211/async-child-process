import childPrinted from '../src/childPrinted'
import {expect} from 'chai'
import {spawn} from 'child_process'

describe('childPrinted', () => {
  it('resolves to output matching regexp', async () => {
    const child = spawn('node', ['-e', `
    setTimeout(function () { console.log('testa') }, 25)
    setTimeout(function () { console.log('test2') }, 50)
    `])
    expect((await childPrinted(child, /test\d/)).trim()).to.equal('test2')
  })
  it('resolves to output matching predicate', async () => {
    const child = spawn('node', ['-e', `
    setTimeout(function () { console.log('testa') }, 25)
    setTimeout(function () { console.log('test2') }, 50)
    `])
    expect((await childPrinted(child, output => output.trim() === 'test2')).trim()).to.equal('test2')
  })
  it('rejects if child exits before output', async () => {
    const child = spawn('node', ['-e', `
    setTimeout(function () { console.log('testa') }, 25)
    setTimeout(function () { process.exit(0) }, 50)
    `])
    let error
    try {
      await childPrinted(child, /test2/)
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
    let promise = childPrinted(child, /test2/).catch(e => error = e)
    // not sure how to close the streams without killing the process, so I'll just fake it...
    child.emit('close')
    await promise
    expect(error.message).to.match(/stream closed/)
  })
  it('listens to both stdout and stderr by default', async () => {
    const child = spawn('node', ['-e', `
    console.log('test1')
    console.error('test2')
    `])
    await childPrinted(child, /test1/)
    await childPrinted(child, /test2/)
  })
  it('listens only to stdout if specified', async () => {
    const child = spawn('node', ['-e', `
    console.error('test1')
    console.log('test2')
    `])
    expect(await childPrinted(child, /test\d/, 'stdout')).to.equal('test2\n')
  })
  it('listens only to stderr if specified', async () => {
    const child = spawn('node', ['-e', `
    console.log('test1')
    console.error('test2')
    `])
    expect(await childPrinted(child, /test\d/, 'stderr')).to.equal('test2\n')
  })
})
