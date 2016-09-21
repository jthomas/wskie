'use strict'

const request = require('request')
const Credentials = require('./credentials.js')

class Action {
  constructor (docker, image, env) {
    this.docker = docker
    this.image = image
    this.container = null
    this.http_port = 8080
    this.env = env
  }

  start () {
    if (this.container) {
      return Promise.reject('Unable to start Action, the container is already running.')
    }

    return new Promise((resolve, reject) => {
      const finished = (err, data, container) => {
        this.container = null
        if (err) return reject(err)
      }

      const started = (container) => {
        this.docker.getContainer(container.id).inspect((err, data) => {
          if (err) return reject(err)
          this.container = data
          this.wait_for_http_server().then(resolve).catch(reject)
        })
      }

      this.docker.run(this.image, [], null, this.get_host_config(), finished).on('start', started)
    })
  }

  stop () {
    if (!this.container) {
      return Promise.reject('Unable to stop Action, the container is not running.')
    }

    return new Promise((resolve, reject) => {
      this.docker.getContainer(this.container.Id).stop(err => {
        if (err) return reject(err)
        this.container = null
        resolve()
      })
    })
  }

  source (action_source) {
    if (!this.container) {
      return Promise.reject('Unable to update Action source without active container.')
    }

    const body = { value: { main: 'main', code: action_source }}
    return this.http_post(this.http_url() + '/init', body)
  }

  invoke (parameters, auth_key) {
    if (!this.container) {
      return Promise.reject('Unable to invoke Action without active container.')
    }

    return Credentials.getWskProps().then(props => {
      return this.http_post(this.http_url() + '/run', {authKey: props.auth, value: parameters})
    })
  }

  // this function is used to verify the HTTP server used by the container
  // for running services is available. we simply poll the server by waiting
  // for a successful HTTP response to a GET to /
  // supports timeouts so we don't wait forever...
  wait_for_http_server (delay = 100, max_delay = 30000) {
    const errMsg = 'Timed out waiting for HTTP server to become available in container.'
    const get_opts = {url: this.http_url()}
    let total_delay = 0

    const poll_server = (resolve, reject) => {
      request.get(get_opts, (err, resp, body) => {
        if (!err) return resolve()
        if (total_delay > max_delay) return reject(new Error(errMsg))
        total_delay += delay
        setTimeout(() => poll_server(resolve, reject), delay)
      })
    }

    return new Promise(poll_server)
  }

  http_post (url, body) {
    return new Promise((resolve, reject) => {
      request.post({ url, body, json: true }, (err, resp, body) => {
        if (err) return reject(err)
        if (resp.statusCode !== 200) return reject(body.error)
        resolve(body)
      })
    })
  }

  http_url () {
    const httpPort = this.host_http_port()

    let ipAddr = httpPort.HostIp

    if (ipAddr === '0.0.0.0') {
      ipAddr = '127.0.0.1'
    }

    return `http://${ipAddr}:${httpPort.HostPort}`
  }

  container_http_port () {
    return `${this.http_port}/tcp`
  }

  host_http_port () {
    const NetSet = this.container.NetworkSettings
    const container_http_port = this.container_http_port()

    if (!NetSet ||
        !NetSet.Ports ||
        !NetSet.Ports[container_http_port] ||
        !NetSet.Ports[container_http_port].length) {
      throw new Error('Exposed container ports does not include HTTP port.')
    }

    const httpPort = NetSet.Ports[container_http_port][0]

    return httpPort
  }

  get_host_config () {
    const container_http_port = this.container_http_port()

    const ExposedPorts = {}
    ExposedPorts[container_http_port] = {}

    const PortBindings = {}
    PortBindings[container_http_port] = [{ HostPort: '' }]

    return {Env: this.env, ExposedPorts, PortBindings}
  }
}

module.exports = Action
