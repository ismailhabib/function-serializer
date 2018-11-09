import { serialize } from '../src/function-serializer'
import { promisify } from '../src/Utils'

/**
 * Dummy test
 */
describe('Function serializer', () => {
  it('Should propagate error', async () => {
    function* errornous() {
      const value = true
      if (value) {
        throw new Error('Error')
      }
      return null
    }

    await expect(serialize(promisify(errornous))()).rejects.toThrowError()
  })

  it('Should propagate error 2', async () => {
    async function errornous() {
      const value = true
      if (value) {
        throw new Error('Error')
      }
      return 0
    }

    await expect(errornous()).rejects.toThrow()
    // expect(serialize(errornous)).toThrowError()
  })

  it('Should not cause data lost', async () => {
    async function asyncInc(value: number) {
      return new Promise<number>((resolve, reject) => {
        setTimeout(() => {
          resolve(value + 1)
        })
      })
    }

    let counter = 0
    function* increment() {
      counter = yield asyncInc(counter)
    }

    const coolIncrement = serialize(promisify(increment))
    // const coolIncrement = promisify(increment)
    await Promise.all([
      coolIncrement(),
      coolIncrement(),
      coolIncrement(),
      coolIncrement(),
      coolIncrement()
    ])
    expect(counter).toBe(5)
  })
})
