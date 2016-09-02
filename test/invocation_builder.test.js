'use strict'

const test = require('ava')

const InvocationBuilder = require('../lib/invocation_builder')
const LocalInvocation = require('../lib/invocations/local')

test('should return local invocation with javascript file parameters', t => {
  const id = 'some_file.js'
  const invocationBuilder = new InvocationBuilder(id, [])

  const invocation = invocationBuilder.invocation()
  t.true(invocation instanceof LocalInvocation, 'File name id resolves to LocalInvocation class')
})

test('should throw error when file identifier is not javascript extension', t => {
  const id = 'some_file.xx'
  const invocationBuilder = new InvocationBuilder(id)

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
})
