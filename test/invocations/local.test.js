'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const fs_stub = {}

const LocalInvocation = proxyquire('../../lib/invocations/local', {'fs': fs_stub})

test('will throw an error during source retrieval if path does not exist', t => {
  t.plan(3)
  const localInvocation = new LocalInvocation('missing.js')

  fs_stub.readFile = (path, encoding, cb) => {
    t.is(path, 'missing.js')
    t.is(encoding, 'utf8')
    cb(new Error('this is the error'))
  }

  t.throws(localInvocation.retrieveActionSource(), /this is the error/)
})

test('will retrieve action source from local path', t => {
  t.plan(3)
  const localInvocation = new LocalInvocation('action.js')

  fs_stub.readFile = (path, encoding, cb) => {
    t.is(path, 'action.js')
    t.is(encoding, 'utf8')
    cb(false, 'sample file contents')
  }

  return localInvocation.retrieveActionSource().then(contents => {
    t.is(contents, 'sample file contents', 'Retrieved Action source matches file contents')
  })
})

test('will retrieve action parameters', t => {
  t.plan(1)
  const parameters = { foo: 'bar', num: 1, bool: true }
  const localInvocation = new LocalInvocation(null, parameters)
  return localInvocation.retrieveParameters().then(_parameters => {
    t.deepEqual(_parameters, parameters, 'Retrieved Action parameters are empty')
  })
})
