'use strict'

const test = require('ava')

const BaseInvocation = require('../../lib/invocations/base')

test('will retrieve action source', t => {
  t.plan(1)
  const baseInvocation = new BaseInvocation()
  return baseInvocation.retrieveActionSource().then(contents => {
    t.is(contents, '', 'Retrieved Action source is empty string')
  })
})

test('will retrieve action parameters', t => {
  t.plan(1)
  const baseInvocation = new BaseInvocation()
  return baseInvocation.retrieveParameters().then(parameters => {
    t.deepEqual(parameters, {}, 'Retrieved Action parameters are empty')
  })
})
