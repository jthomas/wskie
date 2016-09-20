'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const EventEmitter = require('events').EventEmitter

const request_stub = {}

const Action = proxyquire('../lib/action', {'request': request_stub})

test('will start a new Docker container from the Action image', t => {
  t.plan(4)
  const docker_image = 'sample_image'
  const container_id = 'xxxxx12345'
  const container = { Id: container_id, NetworkSettings: { Ports: {'8080/tcp': [{ HostIp: '0.0.0.0', HostPort: '32796'}]}} }

  const ee = new EventEmitter()
  const docker = { 
    run: (image, args, stream, create_opts, cb) => {
      t.is(image, docker_image, 'Docker image passed to run command does not match constructor parameter')
      t.deepEqual(create_opts, { ExposedPorts: { '8080/tcp': {} }, PortBindings: { '8080/tcp': [ { 'HostPort': '' } ] } })
      process.nextTick(() => ee.emit('start', {id: container_id}))
      return ee
    },
    getContainer: (Id) => {
      t.is(Id, container_id, 'Container ID used for retrieval does not match expected valued.')
      return {inspect: (cb) => cb(null, container)}
    }
  }

  const action = new Action(docker, docker_image)
  return action.start().then(() => {
      t.deepEqual(action.container, container, 'Returned Docker container not stored internally')
  })
})

test('will stop the running Docker container for the Action', t => {
  t.plan(2)
  const container = { Id: 'ContainerId' }

  const docker = {
    getContainer: (id) => {
      t.is(id, container.Id, 'Docker container ID should match active container')
      return { stop: (cb) => cb() }
    }
  }

  const action = new Action(docker)
  action.container = container
  return action.stop().then(() => {
    t.is(action.container, null, 'Container instance is null after stopping.')
  })
})

test('will not start container is there is already an active container', t => {
  const action = new Action()
  action.container = true
  t.throws(action.start(), /Unable to start Action, the container is already running/)
})

test('will not stop Action without an active container', t => {
  const action = new Action()
  t.throws(action.stop(), /Unable to stop Action, the container is not running/)
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
  action.container = { NetworkSettings: { Ports: {'8080/tcp': [{ HostIp: '0.0.0.0', HostPort: '32770'}]}} }
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
  action.container = { NetworkSettings: { Ports: {'8080/tcp': [{ HostIp: '0.0.0.0', HostPort: '32770'}]}} }

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
  action.container = { Ports: [{ IP: '0.0.0.0', PrivatePort: 8080, PublicPort: 32770, Type: 'tcp' }] }
  t.throws(action.source(source))
})

test('will retrieve HTTP URL string using exposed container port', t => {
  const action = new Action()
  action.container = { NetworkSettings: { Ports: {'8080/tcp': [{ HostIp: '0.0.0.0', HostPort: '32770'}]}} }
  t.is(action.http_url(), 'http://127.0.0.1:32770', 'HTTP URL does not match exposed port for single port.')

  action.container = { NetworkSettings: { Ports: {'8080/tcp': [{ HostIp: '1.0.0.0', HostPort: '32771'}]}} }
  t.is(action.http_url(), 'http://1.0.0.0:32771', 'HTTP URL does not match exposed port for external IP.')
})

test('will throw exception when exposed port is missing HTTP port', t => {
  const action = new Action()
  action.container = { NetworkSettings: { Ports: {'8081/tcp': [{ HostIp: '1.0.0.0', HostPort: '32771'}]}} }
  t.throws(() => action.http_url(), 'Exposed container ports does not include HTTP port.')

  action.container = { NetworkSettings: { Ports: {'8081/tcp': []}} }
  t.throws(() => action.http_url(), 'Exposed container ports does not include HTTP port.')

  action.container = { NetworkSettings: {} }
  t.throws(() => action.http_url(), 'Exposed container ports does not include HTTP port.')

  action.container = { }
  t.throws(() => action.http_url(), 'Exposed container ports does not include HTTP port.')
})

test('will reject promise when Docker containers fails to start due to error in callback', t => {
  const docker_image = 'sample_image'
  const docker_client = {
    run: (image, args, stream, create_opts, cb) => {
      cb(new Error('unknown docker error'))
    }
  }

  const action = new Action(docker_client, docker_image)
  t.throws(action.start(), /unknown docker error/)
})

test('will reject promise when Docker containers fails to start due to error inspecting container details', t => {
  const docker_image = 'sample_image'
  const ee = new EventEmitter()
  const docker_client = {
    run: (image, args, stream, create_opts, cb) => {
      process.nextTick(() => ee.emit('start', ''))
      return ee
    },

    getContainer: () => ({inspect: (cb) => cb(new Error('unknown docker error'))})
  }

  const action = new Action(docker_client, docker_image)
  t.throws(action.start(), /unknown docker error/)
})
