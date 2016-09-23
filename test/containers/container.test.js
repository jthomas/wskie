'use strict'

const test = require('ava')
const Container = require('../../lib/containers/container')

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
