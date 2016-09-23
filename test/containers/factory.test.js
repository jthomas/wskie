'use strict'

const test = require('ava')
const ContainersFactory = require('../../lib/containers/factory')

test('will spawn a new container image parameter', t => {
  t.plan(2)
  const image_id = 'some_image'
  const port = 8080
  const env = { foo: 'bar' }
  const container = {id: 'container_id'}
  const client = {createContainer: (opts, cb) => {
    t.deepEqual(opts, {
      Image: image_id,
      Env: ['FOO=bar'],
      ExposedPorts: {'8080/tcp': {}},
      PortBindings: {'8080/tcp': [{HostPort: ''}]}})
    cb(null, container)
  }}

  return ContainersFactory(client).create(image_id, env, port).then(container_id => {
    t.is(container_id, container.id, 'Container ID resolved')
  })
})

test('will handle create container failures', t => {
  t.plan(1)
  const image_id = 'some_image'
  const port = 8080
  const env = { foo: 'bar' }
  const client = {createContainer: (opts, cb) => {
    cb(new Error('some error message'))
  }}

  return t.throws(ContainersFactory(client).create(image_id, env, port), 'some error message')
})
