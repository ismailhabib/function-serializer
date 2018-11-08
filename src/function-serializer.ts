export type MailBoxMessage<T> = {
  payload: any[]
  callback: (result?: any, error?: any) => void
}

export function serialize<T extends (...args: any[]) => Promise<any>>(func: T) {
  const mailBox: MailBoxMessage<any>[] = []

  let timerId: any | null = null

  const executeTick = async () => {
    const mail = mailBox.shift()
    let result: any
    const { payload, callback } = mail!

    try {
      result = await func(...payload)
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

  return async (...args: any[]) => {
    const promise: Promise<any> = new Promise<any>((resolve, reject) => {
      mailBox.push({
        payload: args,
        callback: (result, error) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      })
    })

    scheduleNextTick()
    return promise
  }
}
