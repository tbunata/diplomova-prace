import { ChannelCredentials, ListenerBuilder, Metadata } from '@grpc/grpc-js'
import _, { first, groupBy, last, maxBy, meanBy, minBy, times } from 'lodash'
import createDebug from 'debug'

import { performance } from 'perf_hooks'
import { createClient } from 'protocat'
import { ProductRegisterClient } from '../dist/api/product/product_grpc_pb'
// setup DB etc

const ADDRESS = "0.0.0.0:3000"

const debug = createDebug("product_quantity_stream")
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

  const grpcClients = times(
    users.length,
    i => createClient(
      {
        product: ProductRegisterClient,
      },
      ADDRESS,
      ChannelCredentials.createInsecure()
    )
  )
  console.log(`first user: ${first(users)?.id ?? 'undefined'}`)
  console.log(`last user: ${last(users)?.id ?? 'undefined'}`)
  console.log(`received ${users.length} of users`)
  let messageCount = 0
  const promises = times(users.length, i => {
    const client = grpcClients[i]
    const userId = users[i].id
    const meta = new Metadata()
    const { status, metadata, call } = client.product.getProductQuantityStream(req =>
      req.setId(userId))
    console.log(status)
    const start = performance.now()
    return new Promise<void>((resolve, reject) => {
      call.on('data', (d: any) => {
        seenUsers.add(userId)
        messages.push({ userId, message: d.getQuantity() })
        messageCount += 1
        if (userId == 1) {
          console.log(`timestamp: ${performance.now()}`);
          
        }
      })
      call.on('error', e => {
        console.log(JSON.stringify(e))
        errors.push({ userId, error: JSON.parse(JSON.stringify(e)) })
        ends.push({
          userId,
          durationMillis: performance.now() - start,
          event: 'error',
        })
        reject(e)
      })
      call.on('close', (_: any) => {
        ends.push({
          userId,
          durationMillis: performance.now() - start,
          event: 'close',
        })
        resolve()
      })
      call.on('end', (_: any) => {
        ends.push({
          userId,
          durationMillis: performance.now() - start,
          event: 'end',
        })
        resolve()
      })
    })
  })
  await Promise.allSettled(promises)
  console.log(JSON.stringify(messages))
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
  debug('end watching')
  process.exit(0)
})()
