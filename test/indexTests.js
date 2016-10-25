import {expect} from 'chai'
import * as acp from '../src/index'
import childPrinted from '../src/childPrinted'
import execAsync from '../src/execAsync'
import join from '../src/join'
import kill from '../src/kill'

describe('index', () => {
  it('exports childPrinted', () => {
    expect(acp.childPrinted).to.equal(childPrinted)
  })
  it('exports execAsync', () => {
    expect(acp.execAsync).to.equal(execAsync)
  })
  it('exports join', () => {
    expect(acp.join).to.equal(join)
  })
  it('exports kill', () => {
    expect(acp.kill).to.equal(kill)
  })
})
