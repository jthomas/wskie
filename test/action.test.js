'use strict'

const test = require('ava')
const Action = require('../lib/action')

test('will start a new Docker container from the Action image', t => {
  t.plan(1)
  const docker_image = 'sample_image'
  const docker_client = {
    run: (image, args, stream, cb) => {
      t.is(image, docker_image, 'Docker image passed to run command does not match constructor parameter')
      cb()
    }
  }
  const action = new Action(docker_image, docker_client)
  action.start()
})

test('will reject promise when Docker containers fails to start due to error in callback', t => {
  const docker_image = 'sample_image'
  const docker_client = {
    run: (image, args, stream, cb) => {
      cb(new Error('unknown docker error'))
    }
  }

  const action = new Action(docker_image, docker_client)
  t.throws(action.start(), /unknown docker error/)
})
