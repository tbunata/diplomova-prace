import WebSocket from 'ws';
import _, { first, groupBy, last, maxBy, meanBy, minBy, times } from 'lodash'

import { performance } from 'perf_hooks'

const ADDRESS = "ws://localhost:3000/products/1/quantity"

const errors: Array<{ userId: string; error: any }> = []
const messages: Array<{ userId: string; message: any }> = []
const ends: Array<{
  userId: string
  durationMillis: number
  event: 'close' | 'error' | 'end'
}> = []



const OFFSET = process.env.OFFSET ? Number(process.env.OFFSET) : 0
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : 100

const seenUsers = new Set()

const NUMBER_OF_USERS = process.env.NUMBER_OF_USERS
  ? Number(process.env.NUMBER_OF_USERS)
  : 1000

void (async () => {
  console.log('start watching')
  // list users etc.
  let users = new Array()
  
  for (let i = 1; i < 10000; i+=1) {
    users.push({
      id: i,
    })
  }

  console.log(`first user: ${first(users)?.id ?? 'undefined'}`)
  console.log(`last user: ${last(users)?.id ?? 'undefined'}`)
  console.log(`received ${users.length} of users`)
  let messageCount = 0
  const promises = times(users.length, i => {
    const userId = users[i].id
    let socket = new WebSocket("ws://localhost:3000/products/1/quantity");
    return new Promise<void>((resolve, reject) => {
      let start: number
      let end: number
      socket.onopen = function(e) {
        start = performance.now()
        if(userId == 1) {
          console.log(`[open] XXX again Connection established: ${userId}`);
        }
        console.log(`[open] Connection established: ${userId}`);
      };
      socket.onmessage = function(event) {
        seenUsers.add(userId)
        if(userId == 1) {
          console.log(`timestamp; ${performance.now()}`)
        }
        messages.push({ userId, message: event.data })
        messageCount += 1
        // console.log(`[message] Data received from server: ${event.data}`);
      };
      
      socket.onclose = function(event) {
        end = performance.now()
        
        if (event.wasClean) {
          console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
          console.log(`duration: ${end - start}`)
          resolve()
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          errors.push({ userId, error: JSON.parse(JSON.stringify(event.reason)) })
          console.log('[close] Connection died');
          reject()
        }
      };
    })
  })
  await Promise.allSettled(promises)
  // console.log(JSON.stringify(messages))
  console.log('# of errors: ', errors.length)
  console.log(
    'error codes count: ',
    groupBy(errors, o => o.error.code)
  )
  console.log('# of messages', messages.length)
  console.log('AVG # of messages per client: ', messages.length / users.length)
  console.log(
    'AVG stream duration [s]: ',
    meanBy(ends, e => e.durationMillis)
  )
  console.log(
    'MAX stream duration [s]: ',
    maxBy(ends, e => e.durationMillis)
  )
  console.log(
    'MIN stream duration [s]: ',
    minBy(ends, e => e.durationMillis)
  )
  console.log('SEEN USERS: ', seenUsers.size)
  process.exit(0)
})()
