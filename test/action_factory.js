'use strict'

const ActionFactory = require('../lib/action_factory')
const test = require('ava')

test('will create new Action instances with default parameters', t => {
  const action = ActionFactory.create()
  t.is(action.image, 'nodejsaction')
  t.is(action.docker.modem.socketPath, '/var/run/docker.sock')
})
