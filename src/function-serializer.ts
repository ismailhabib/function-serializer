export type MailBoxMessage = {
  payload: unknown[]
  callback: (result?: unknown, error?: unknown) => void
}

export type Options = {
  strategy?: 'IgnoreOlder' | 'IgnoreNewer'
  debounce?: number
}

export function serialize<T extends any[], U>(
  func: (...args: T) => Promise<U>,
  options: Options = {}
) {
  const mailBox: MailBoxMessage[] = []

  let timerId: any | null = null

  const executeTick = async () => {
    const mail = mailBox.shift()
    let result: any
    const { payload, callback } = mail!

    try {
      result = await func(...(payload as T))
      callback(result)
    } catch (e) {
      callback(undefined, e)
    }

    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }

    if (mailBox.length) {
      scheduleNextTick()
    }
  }

  const scheduleNextTick = () => {
    if (!timerId) {
      timerId = setTimeout(() => {
        executeTick()
      })
    }
  }

  return async (...args: T) => {
    const promise: Promise<U> = new Promise<U>((resolve, reject) => {
      mailBox.push({
        payload: args,
        callback: (result, error) => {
          if (error) {
            reject(error)
          } else {
            resolve(result as U)
          }
        }
      })
    })

    scheduleNextTick()
    return promise
  }
}
