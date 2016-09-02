'use strict'

const test = require('ava')
const ActionInvocation = require('../../lib/invocations/action.js')

test('will retrieve action source from remote action identifier', t => {
  t.plan(2)
  const client = {}
  const action = 'actionId'
  const actionSource = 'sample action contents'
  const actionInvocation = new ActionInvocation(client, action)

  client.actions = {
    get: (params) => {
      t.is(params.actionName, action)
      return Promise.resolve({exec: {code: actionSource}})
    }
  }

  return actionInvocation.retrieveActionSource().then(contents => {
    t.is(contents, actionSource, 'Retrieved Action source matches remote Action contents')
  })
})

test('will throw error if client fails to retrieve action source', t => {
  const client = {}
  const actionInvocation = new ActionInvocation(client)

  client.actions = {
    get: (params) => Promise.reject('some error')
  }

  t.throws(actionInvocation.retrieveActionSource(), /some error/)
})

test('will retrieve action parameters', t => {
  t.plan(1)
  const parameters = { foo: 'bar', num: 1, bool: true }
  const actionInvocation = new ActionInvocation(null, null, parameters)
  return actionInvocation.retrieveParameters().then(_parameters => {
    t.deepEqual(_parameters, parameters, 'Retrieved Action parameters are empty')
  })
})
