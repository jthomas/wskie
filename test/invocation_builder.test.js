'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const stub = {}
const InvocationBuilder = proxyquire('../lib/invocation_builder', {'./credentials.js': stub})
const LocalInvocation = require('../lib/invocations/local')
const ActionInvocation = require('../lib/invocations/action')

test('should return local invocation with javascript file parameters', t => {
  t.plan(1)
  const id = 'some_file.js'
  const invocationBuilder = new InvocationBuilder(id, [])

  return invocationBuilder.invocation().then(invocation => {
    t.true(invocation instanceof LocalInvocation, 'File name id resolves to LocalInvocation class')
  })
})

test('should return openwhisk action for string identifier', t => {
  t.plan(4)
  const id = 'action_name'
  stub.getWskProps = () => (Promise.resolve({
    apihost: 'localhost',
    auth: 'password',
    namespace: 'ns'
  }))
  const invocationBuilder = new InvocationBuilder(id, [])

  return invocationBuilder.invocation().then(invocation => {
    t.true(invocation instanceof ActionInvocation, 'Action identifier should resolve to ActionInvocation class')
    t.is(invocation.client.actions.options.namespace, 'ns', 'Openwhisk namespace matches user credentials')
    t.is(invocation.client.actions.options.api, 'https://localhost/api/v1/', 'Openwhisk endpoint matches user credentials')
    t.is(invocation.client.actions.options.api_key, 'password', 'Openwhisk api key matches user credentials')
  })
})

test('should reject promise when openwhisk credentials are missing for action identifier', t => {
  const id = 'action_name'
  stub.getWskProps = () => (Promise.resolve({
  }))
  const invocationBuilder = new InvocationBuilder(id, [])

  return t.throws(invocationBuilder.invocation(), /Missing OpenWhisk credentials/)
})

test('should throw error when file identifier is not javascript extension', t => {
  let id = 'some_file.py'
  let invocationBuilder = new InvocationBuilder(id)

  t.throws(() => invocationBuilder.invocation(), /Unsupported file extension for Action/)

  id = 'some_file.java'
  invocationBuilder = new InvocationBuilder(id)

  t.throws(() => invocationBuilder.invocation(), /Unsupported file extension for Action/)
})

test('should parse parameters from command-line options for invocation', t => {
  const invocationBuilder = new InvocationBuilder()

  invocationBuilder.parameters = ['hello=world']
  t.deepEqual(invocationBuilder.parseParameters(), {hello: 'world'}, 'Parses simple command-line options')

  invocationBuilder.parameters = ['hello=world', 'foo=bar']
  t.deepEqual(invocationBuilder.parseParameters(), {foo: 'bar', hello: 'world'}, 'Parses multiple parameter command-line options')

  invocationBuilder.parameters = ['hello=world', 'foo=bar', 'hello=bar']
  t.deepEqual(invocationBuilder.parseParameters(), {foo: 'bar', hello: 'bar'}, 'Parses repeat parameter command-line options')

  invocationBuilder.parameters = ['hello=wo=rld=']
  t.deepEqual(invocationBuilder.parseParameters(), {hello: 'wo=rld='}, 'Parses parameter command-line options containing =')

  invocationBuilder.parameters = ['hello']
  t.deepEqual(invocationBuilder.parseParameters(), {}, 'Parses parameter command-line options ignoring invalid values')

  invocationBuilder.parameters = ['hello=[1,2,3,4,5]']
  t.deepEqual(invocationBuilder.parseParameters(), {hello: [1, 2, 3, 4, 5]}, 'Parses list parameter command-line options')

  invocationBuilder.parameters = ['hello={"testing": 1}']
  t.deepEqual(invocationBuilder.parseParameters(), {hello: {testing: 1}}, 'Parses object parameter command-line options')

  invocationBuilder.parameters = ['hello={"test']
  t.deepEqual(invocationBuilder.parseParameters(), {hello: '{"test'}, 'Parses broken JSON as string command-line options')
})
