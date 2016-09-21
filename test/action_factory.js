'use strict'

const stub = {}
const proxyquire = require('proxyquire')
const ActionFactory = proxyquire('../lib/action_factory', {'./credentials.js': stub})
const test = require('ava')

test('will create new Action instances with default parameters', t => {
  t.plan(3)
  stub.getWskProps = () => (Promise.resolve({}))
  return ActionFactory.create().then(action => {
    t.is(action.image, 'nodejsaction')
    t.is(action.docker.modem.socketPath, '/var/run/docker.sock')
    t.deepEqual(action.env, ['EDGE_HOST=openwhisk.ng.bluemix.net', 'AUTH_KEY=missing'])
  })
})

test('will create new Action instances using whisk credentials from wskprops file', t => {
  t.plan(1)
  stub.getWskProps = () => (Promise.resolve({
    apihost: 'localhost',
    auth: 'password',
    namespace: 'ns'
  }))
  return ActionFactory.create().then(action => {
    t.deepEqual(action.env, ['EDGE_HOST=localhost', 'AUTH_KEY=password'])
  })
})
