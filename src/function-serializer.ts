export type MailBoxMessage<T> = {
  payload: any[]
  callback: (result?: any, error?: any) => void
}

export type Serialized<T extends (...args: any[]) => Promise<any>> = T extends () => Promise<
  infer R
>
  ? () => Promise<R>
  : T extends (a1: infer A1) => Promise<infer R>
  ? (a1: A1) => Promise<R>
  : T extends (a1: infer A1, a2: infer A2) => Promise<infer R>
  ? (a1: A1, a2: A2) => Promise<R>
  : T extends (a1: infer A1, a2: infer A2, a3: infer A3) => Promise<infer R>
  ? (a1: A1, a2: A2, a3: A3) => Promise<R>
  : T extends (a1: infer A1, a2: infer A2, a3: infer A3, a4: infer A4) => Promise<infer R>
  ? (a1: A1, a2: A2, a3: A3, a4: A4) => Promise<R>
  : T extends (
      a1: infer A1,
      a2: infer A2,
      a3: infer A3,
      a4: infer A4,
      a5: infer A5
    ) => Promise<infer R>
  ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => Promise<R>
  : T extends (
      a1: infer A1,
      a2: infer A2,
      a3: infer A3,
      a4: infer A4,
      a5: infer A5,
      a6: infer A6
    ) => Promise<infer R>
  ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6) => Promise<R>
  : T extends (
      a1: infer A1,
      a2: infer A2,
      a3: infer A3,
      a4: infer A4,
      a5: infer A5,
      a6: infer A6,
      a7: infer A7
    ) => Promise<infer R>
  ? (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5, a6: A6, a7: A7) => Promise<R>
  : never

export function serialize<T extends (...args: any[]) => Promise<any>>(func: T): Serialized<T>
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
