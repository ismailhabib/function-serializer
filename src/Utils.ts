export type CancellablePromise<T> = Promise<T> & { cancel(): void }

export function promisify<T extends any[], U>(
  generator: (...args: T) => IterableIterator<U>
): (...args: T) => CancellablePromise<Exclude<U, Promise<any>>> {
  // Implementation based on https://github.com/tj/co/blob/master/index.js
  return function() {
    const args = arguments
    const ctx = this
    const gen: IterableIterator<any> = generator.apply(ctx, args)
    let rejector: (error: any) => void
    let currentPromise: CancellablePromise<any> | undefined = undefined

    const res = new Promise((resolve, reject) => {
      rejector = reject

      function onFulfilled(res: any) {
        currentPromise = undefined
        let result
        try {
          result = gen.next(res)
        } catch (e) {
          reject(e)
          return
        }

        // noinspection JSIgnoredPromiseFromCall
        next(result)
      }

      function onRejected(err: any) {
        currentPromise = undefined
        let result
        try {
          result = gen.throw!(err)
        } catch (e) {
          reject(e)
          return
        }
        // noinspection JSIgnoredPromiseFromCall
        next(result)
      }

      function next(ret: any) {
        if (ret && typeof ret.then === 'function') {
          // an async iterator
          ret.then(next, reject)
          return
        }
        if (ret.done) {
          resolve(ret.value)
          return
        }
        currentPromise = Promise.resolve(ret.value) as any
        return currentPromise!.then(onFulfilled, onRejected)
      }

      onFulfilled(undefined) // kick off the process
    }) as any

    res.cancel = function() {
      try {
        if (currentPromise) {
          cancelPromise(currentPromise)
        }
        const res = gen.return!()
        // eat anything that promise would do, it's cancelled!
        const yieldedPromise = Promise.resolve(res.value)
        yieldedPromise.then(
          () => {
            /* nothing */
          },
          () => {
            /* nothing */
          }
        )
        cancelPromise(yieldedPromise) // maybe it can be cancelled :)
        rejector(new Error('PROMISE_CANCELLED'))
      } catch (e) {
        rejector(e) // there could be a throwing finally block
      }
    }
    return res
  }
}

function cancelPromise(promise: any) {
  if (typeof promise.cancel === 'function') {
    promise.cancel()
  }
}
