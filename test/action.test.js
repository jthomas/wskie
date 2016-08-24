'use strict'

const test = require('ava')

const proxyquire = require('proxyquire')

const request_stub = {}

const Action = proxyquire('../lib/action', {'request': request_stub})

test('will start a new Docker container from the Action image', t => {
  t.plan(2)
  const docker_image = 'sample_image'
  const container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 80, PublicPort: 32770, Type: 'tcp' }] }

  const docker = {
    run: (image, args, stream, cb) => {
      t.is(image, docker_image, 'Docker image passed to run command does not match constructor parameter')
      cb(false, {}, container)
      t.deepEqual(action.container, container, 'Returned Docker container not stored internally')
    }
  }

  const action = new Action(docker, docker_image)
  action.start()
})

test('will throw exception if we try to update source without active container', t => {
  const action = new Action()
  t.throws(action.source(), /Unable to update Action source without active container/)
})

test('will throw exception if we try to invoke action without active container', t => {
  const action = new Action()
  t.throws(action.invoke(), /Unable to invoke Action without active container/)
})

test('can update action source for running containers', t => {
  const source = 'testing'
  t.plan(3)

  request_stub.post = (options, cb) => {
    t.is(options.url, 'http://127.0.0.1:32770/init', 'URL does not match Docker container host & port.')
    t.is(options.json, true, 'JSON parameter not set in HTTP POST options')
    t.deepEqual(options.body, { value: { main: 'main', code: source } }, 'HTTP POST body does not container Action source')
    cb()
  }

  const action = new Action()
  action.container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 80, PublicPort: 32770, Type: 'tcp' }] }
  return action.source(source)
})

test('can invoke action with parameters on running container', t => {
  const args = { hello: 'world' }
  const result = { world: 'hello' }
  t.plan(4)

  request_stub.post = (options, cb) => {
    t.is(options.url, 'http://127.0.0.1:32770/run', 'URL does not match Docker container host & port.')
    t.is(options.json, true, 'JSON parameter not set in HTTP POST options')
    t.deepEqual(options.body, { value: args }, 'HTTP POST body does not container invocation parameters')
    cb(false, {}, result)
  }

  const action = new Action()
  action.container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 80, PublicPort: 32770, Type: 'tcp' }] }

  return action.invoke(args).then(body => {
    t.deepEqual(body, result, 'HTTP POST response does not match promise result.')
  })
})

test('will reject promise when updating action source request fails', t => {
  const source = 'testing'

  request_stub.post = (options, cb) => {
    cb(true)
  }

  const action = new Action()
  action.container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 80, PublicPort: 32770, Type: 'tcp' }] }
  t.throws(action.source(source))
})

test('will retrieve HTTP URL string using exposed container port', t => {
  const action = new Action()
  action.container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 80, PublicPort: 32770, Type: 'tcp' }] }
  t.is(action.http_url(), 'http://127.0.0.1:32770', 'HTTP URL does not match exposed port for single port.')

  action.container = { Ports: [{ IP: '1.0.0.0', PrivatePort: 80, PublicPort: 32770, Type: 'tcp' }] }
  t.is(action.http_url(), 'http://1.0.0.0:32770', 'HTTP URL does not match exposed port for external IP.')

  action.container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 81, PublicPort: 32771, Type: 'tcp' }, { IP: '0.0.0.0', PrivatePort: 80, PublicPort: 32770, Type: 'tcp' }] }
  t.is(action.http_url(), 'http://127.0.0.1:32770', 'HTTP URL does not match exposed port for multiple ports.')
})

test('will throw exception when exposed port is missing HTTP port', t => {
  const action = new Action()
  action.container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 81, PublicPort: 32770, Type: 'tcp' }] }
  t.throws(() => action.http_url(), 'Exposed container ports does not include HTTP port.')
})

test('will reject promise when Docker containers fails to start due to error in callback', t => {
  const docker_image = 'sample_image'
  const docker_client = {
    run: (image, args, stream, cb) => {
      cb(new Error('unknown docker error'))
    }
  }

  const action = new Action(docker_client, docker_image)
  t.throws(action.start(), /unknown docker error/)
})
