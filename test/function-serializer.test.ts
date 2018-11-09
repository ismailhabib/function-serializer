import { serialize } from '../src/function-serializer'
import { promisify } from '../src/Utils'

/**
 * Dummy test
 */
describe('Function serializer', () => {
  it('should have the proper typings', async () => {
    async function add(x: number, y: number) {
      return x + y
    }

    const serializedAdd = serialize(add)
    await serializedAdd(1, 2)
  })

  it('Should propagate error', async () => {
    function* errornous() {
      const value = true
      if (value) {
        throw new Error('Error')
      }
      return null
    }

    await expect(serialize(promisify(errornous))()).rejects.toThrowError('Error')
  })

  it('Should propagate error 2', async () => {
    async function errornous() {
      const value = true
      if (value) {
        throw new Error('Error')
      }
      return 0
    }

    await expect(errornous()).rejects.toThrowError('Error')
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
