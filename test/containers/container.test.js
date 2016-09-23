'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')

const request_stub = {}
const Container = proxyquire('../../lib/containers/container', {'request': request_stub})

test('will return whether container is running for running container', t => {
  t.plan(2)
  const id = 'container_id'
  const data = { State: { Running: true } }
  const inspect = cb => cb(false, data)
  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { inspect }
    }
  }
  const container = new Container(client, id)

  return container.isRunning().then(running => {
    t.true(running)
  })
})

test('will return whether container is running for stopped container', t => {
  t.plan(2)
  const id = 'container_id'
  const data = { State: { Running: false} }
  const inspect = cb => cb(false, data)
  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { inspect }
    }
  }
  const container = new Container(client, id)

  return container.isRunning().then(running => {
    t.false(running)
  })
})

test('will get container details from docker client', t => {
  t.plan(2)
  const id = 'container_id'
  const data = { Id: id, State: { Running: true } }
  const inspect = cb => cb(false, data)
  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { inspect }
    }
  }
  const container = new Container(client, id)

  return container.getState().then(state => {
    t.deepEqual(state, data, 'Container state matches client result')
  })
})

test('will handle failing to retrieve container details from docker client', t => {
  const id = 'container_id'
  const inspect = cb => cb(new Error('some error message'))
  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { inspect }
    }
  }
  const container = new Container(client, id)

  return t.throws(container.getState(), 'some error message')
})

test('will start container that is not running', t => {
  t.plan(1)
  const id = 'container_id'
  const start = cb => cb(false)

  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { start }
    }
  }

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(false)
  return container.start()
})

test('will not start container that is already running', t => {
  const id = 'container_id'
  const start = cb => {
    t.fail()
    cb()
  }

  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { start }
    }
  }

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(true)
  return container.start()
})

test('will handle container start failures', t => {
  const id = 'container_id'
  const start = cb => cb(new Error('some error message'))

  const client = {
    getContainer: (containerId) => {
      return { start }
    }
  }

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(false)
  return t.throws(container.start(), 'some error message')
})

test('will stop container that is running', t => {
  t.plan(1)
  const id = 'container_id'
  const stop = cb => cb(false)

  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { stop }
    }
  }

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(true)
  return container.stop()
})

test('will not stop container that is not already running', t => {
  const id = 'container_id'
  const stop = cb => {
    t.fail()
    cb()
  }

  const client = {
    getContainer: (containerId) => {
      t.is(id, containerId, 'Matches container id')
      return { stop }
    }
  }

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(false)
  return container.stop()
})

test('will handle container start failures', t => {
  const id = 'container_id'
  const stop = cb => cb(new Error('some error message'))

  const client = {
    getContainer: (containerId) => {
      return { stop }
    }
  }

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(true)
  return t.throws(container.stop(), 'some error message')
})

test('will retrieve HTTP URL string using exposed container port', t => {
  t.plan(1)
  const id = 'container_id'
  const client = {}

  const container = new Container(client, id)
  container.getState = () => Promise.resolve({ NetworkSettings: { Ports: {'8080/tcp': [{ HostIp: '0.0.0.0', HostPort: '32770'}]}} })
  return container.httpUrl().then(httpUrl => {
    t.is(httpUrl, 'http://127.0.0.1:32770', 'HTTP URL does not match exposed port for single port.')
  })
})

test('will retrieve HTTP URL string for non-localhost IP using exposed container port', t => {
  t.plan(1)
  const id = 'container_id'
  const client = {}

  const container = new Container(client, id)
  container.getState = () => Promise.resolve({ NetworkSettings: { Ports: {'8080/tcp': [{ HostIp: '1.0.0.0', HostPort: '32771'}]}} })
  return container.httpUrl().then(httpUrl => {
    t.is(httpUrl, 'http://1.0.0.0:32771', 'HTTP URL does not match exposed port for single port.')
  })
})

test('will throw exception when exposed port is missing HTTP port', t => {
  t.plan(4)
  const id = 'container_id'
  const client = {}

  const container = new Container(client, id)
  container.getState = () => Promise.resolve({ NetworkSettings: { Ports: {'8081/tcp': [{ HostIp: '1.0.0.0', HostPort: '32771'}]}} })
  t.throws(container.httpUrl(), 'Exposed container ports does not include HTTP port.')

  container.getState = () => Promise.resolve({ NetworkSettings: { Ports: {'8080/tcp': []}} })
  t.throws(container.httpUrl(), 'Exposed container ports does not include HTTP port.')

  container.getState = () => Promise.resolve({ NetworkSettings: {} })
  t.throws(container.httpUrl(), 'Exposed container ports does not include HTTP port.')

  container.getState = () => Promise.resolve({})
  t.throws(container.httpUrl(), 'Exposed container ports does not include HTTP port.')
})

test('will test whether http server is available when container is not running', t => {
  const id = 'container_id'
  const client = {}

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(false)
  return t.throws(container.httpPortOpen(), 'Container is not running')
})

test.serial('will test whether http server is available', t => {
  t.plan(1)
  const id = 'container_id'
  const client = {}

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(true)

  container.httpUrl = () => Promise.resolve('http://127.0.0.1:12345')
  request_stub.get = (options, cb) => {
    t.is(options.url, 'http://127.0.0.1:12345', 'URL does not match Docker container host & port.')
    cb(false)
  }

  return container.httpPortOpen()
})

test.serial('will test whether http server is available with delay', t => {
  t.plan(3)
  const id = 'container_id'
  const client = {}
  let ready = false

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(true)

  container.httpUrl = () => Promise.resolve('http://127.0.0.1:12345')
  request_stub.get = (options, cb) => {
    t.is(options.url, 'http://127.0.0.1:12345', 'URL does not match Docker container host & port.')
    cb(!ready)
  }

  setTimeout(() => {
    ready = true
  }, 150)

  return container.httpPortOpen()
})

test.serial('will test whether http server is available with variable delay', t => {
  t.plan(4)
  const id = 'container_id'
  const client = {}
  let ready = false

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(true)

  container.httpUrl = () => Promise.resolve('http://127.0.0.1:12345')
  request_stub.get = (options, cb) => {
    t.is(options.url, 'http://127.0.0.1:12345', 'URL does not match Docker container host & port.')
    cb(!ready)
  }

  setTimeout(() => {
    ready = true
  }, 150)

  return container.httpPortOpen(50)
})

test.serial('will timeout waiting for http server to be available', t => {
  t.plan(1)
  const id = 'container_id'
  const client = {}

  const container = new Container(client, id)
  container.isRunning = () => Promise.resolve(true)

  container.httpUrl = () => Promise.resolve('http://127.0.0.1:12345')
  request_stub.get = (options, cb) => {
    cb(true)
  }

  return t.throws(container.httpPortOpen(50, 100), 'Timed out waiting for HTTP server to become available in container.')
})
