'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const console_stub = {}
const invocation = {}
const stub_result = {
  invocation: () => ({retrieve: () => Promise.resolve(invocation)})
}
const ib_stub = function () {
  return stub_result
}

const action = {
  start: () => Promise.resolve(),
  stop: () => Promise.resolve(),
  source: () => Promise.resolve(),
  invoke: () => Promise.resolve()
}

const af_stub = {
  create: () => action
}

const InvokeCommand = proxyquire('../../lib/commands/invoke.js', {'console': console_stub, '../invocation_builder.js': ib_stub, '../action_factory.js': af_stub})

test.serial('will invoke new local action without parameters and print results', t => {
  t.plan(3)
  const logs = []
  action.invoke = () => Promise.resolve({message: 'Hello unknown!'})
  console_stub.log = (...text) => logs.push(...text)
  return InvokeCommand('source.js', []).then(() => {
    t.is(logs.length, 2, 'invoke commands outputs one log line')
    t.is(logs[0], 'invoking action from local file: source.js', 'invoke command output references local file')
    t.is(logs[1], '{\n  "message": "Hello unknown!"\n}', 'invoke command prints action output')
  })
})

test.serial('will handle invocation retrieve failing', t => {
  stub_result.invocation = () => ({retrieve: () => Promise.reject('hello')})
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 3, 'invoke commands outputs three log lines')
    t.is(logs[0], 'invoking action from local file: source.js', 'invoke command output references local file')
    t.is(logs[1], '❌  Oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[2], 'hello', 'invoke command print error trace')
  })
})

test.serial('will handle action start failing', t => {
  stub_result.invocation = () => ({retrieve: () => Promise.resolve()})
  action.start = () => Promise.reject('failed')
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 3, 'invoke commands outputs three log lines')
    t.is(logs[0], 'invoking action from local file: source.js', 'invoke command output references local file')
    t.is(logs[1], '❌  Oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[2], 'failed', 'invoke command print error trace')
  })
})

test.serial('will handle action source failing', t => {
  stub_result.invocation = () => ({retrieve: () => Promise.resolve({})})
  action.start = () => Promise.resolve()
  action.source = () => Promise.reject('failed')
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 3, 'invoke commands outputs three log lines')
    t.is(logs[0], 'invoking action from local file: source.js', 'invoke command output references local file')
    t.is(logs[1], '❌  Oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[2], 'failed', 'invoke command print error trace')
  })
})

test.serial('will handle action invoke failing', t => {
  stub_result.invocation = () => ({retrieve: () => Promise.resolve({})})
  action.start = () => Promise.resolve()
  action.source = () => Promise.resolve()
  action.invoke = () => Promise.reject('failed')
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 3, 'invoke commands outputs three log lines')
    t.is(logs[0], 'invoking action from local file: source.js', 'invoke command output references local file')
    t.is(logs[1], '❌  Oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[2], 'failed', 'invoke command print error trace')
  })
})
