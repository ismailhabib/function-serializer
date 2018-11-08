import { serialize } from '../src/function-serializer'
import { promisify } from '../src/Utils'

/**
 * Dummy test
 */
describe('Function serializer', () => {
  it('Should not impacted by data lost', async () => {
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
    try {
      await Promise.all([coolIncrement(), coolIncrement(), coolIncrement()])
    } catch (e) {
      console.log('error', e)
    }
    console.log(counter)
  })
})
