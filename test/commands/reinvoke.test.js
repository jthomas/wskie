'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const strip = require('strip-ansi')

// const console_stub = {}

const ReinvokeCommand = proxyquire('../../lib/commands/reinvoke.js', {})

test.serial('will reinvoke action from existing container', t => {
  t.plan(3)
  const logs = []
  // console_stub.log = (...text) => logs.push(...text)
  return ReinvokeCommand('container_id', []).then(() => {
    t.is(logs.length, 3, 'invoke commands outputs one log line')
    t.is(strip(logs[0]), 'invoking action from existing container: container_id', 'reinvoke command output references local file')
    t.is(strip(logs[2]), '{\n  "message": "Hello unknown!"\n}', 'invoke command prints action output')
  })
})

/*
test.serial('will handle invocation retrieve failing', t => {
  stub_result.invocation = () => (Promise.resolve({invocationType: () => 'test', invocationId: () => 'test', retrieve: () => Promise.reject('hello')}))
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 2, 'invoke commands outputs three log lines')
    t.is(strip(logs[0]), 'oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[1], 'hello', 'invoke command print error trace')
  })
})

test.serial('will handle action start failing', t => {
  stub_result.invocation = () => (Promise.resolve({invocationId: () => 'test', invocationType: () => 'test source', retrieve: () => Promise.resolve(invocation)}))
  action.start = () => Promise.reject('failed')
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 2, 'invoke commands outputs three log lines')
    t.is(strip(logs[0]), 'oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[1], 'failed', 'invoke command print error trace')
  })
})

test.serial('will handle action source failing', t => {
  stub_result.invocation = () => (Promise.resolve({invocationId: () => 'test', invocationType: () => 'test source', retrieve: () => Promise.resolve(invocation)}))
  action.start = () => Promise.resolve()
  action.source = () => Promise.reject('failed')
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 2, 'invoke commands outputs three log lines')
    t.is(strip(logs[0]), 'oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[1], 'failed', 'invoke command print error trace')
  })
})

test.serial('will handle action invoke failing', t => {
  stub_result.invocation = () => (Promise.resolve({invocationId: () => 'test', invocationType: () => 'test source', retrieve: () => Promise.resolve(invocation)}))
  action.start = () => Promise.resolve()
  action.source = () => Promise.resolve()
  action.invoke = () => Promise.reject('failed')
  const logs = []
  console_stub.log = (...text) => logs.push(...text)
  t.throws(InvokeCommand('source.js', [])).then(() => {
    t.is(logs.length, 2, 'invoke commands outputs three log lines')
    t.is(strip(logs[0]), 'oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n', 'invoke command prints error message')
    t.is(logs[1], 'failed', 'invoke command print error trace')
  })
})
*/
