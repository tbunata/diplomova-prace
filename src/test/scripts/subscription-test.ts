import WebSocket from 'ws';
import _, { first, groupBy, last, maxBy, meanBy, minBy, times } from 'lodash'

import { performance } from 'perf_hooks'

import { execute } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import gql from 'graphql-tag';
import ws from 'ws';

const ADDRESS = 'ws://localhost:3333/graphql'

const getWsClient = function(ADDRESS: string) {
  const client = new SubscriptionClient(
    ADDRESS, {reconnect: true}, ws
  );
  return client;
};

const createSubscriptionObservable = (ADDRESS: any, query: any, variables: any) => {
  const link = new WebSocketLink(getWsClient(ADDRESS));
  return execute(link, {query: query, variables: variables});
};


// A subscription query to get changes for author with parametrised id 
// using $id as a query variable
const SUBSCRIBE_QUERY = gql`
subscription {
  quantityUpdate(productIds: [1]) {
    name
    quantity
  }
}
`;


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

  const subscriptionClients = times(
    users.length,
    i => createSubscriptionObservable(
      ADDRESS,
      SUBSCRIBE_QUERY,
      {id: 1}
    )
  )

  console.log(`first user: ${first(users)?.id ?? 'undefined'}`)
  console.log(`last user: ${last(users)?.id ?? 'undefined'}`)
  console.log(`received ${users.length} of users`)
  let messageCount = 0
  const promises = times(users.length, i => {
    const userId = users[i].id
    const client = subscriptionClients[i]
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, 50000)
      var consumer = client.subscribe(eventData => {
        // Do something on receipt of the event
        if (userId == 1) {
          console.log(`Received event: ${performance.now()}`);
          console.log(JSON.stringify(eventData, null, 2));
        }
        messages.push({userId: userId, message: JSON.stringify(eventData, null, 2)})
        messageCount += 1
      }, (err) => {
        console.log('Err');
        console.log(err);
        errors.push({userId: userId, error: err})
        reject()
      });
      console.log(`created: ${userId}`);
      
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
