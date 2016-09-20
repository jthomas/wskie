'use strict'

const request = require('request')

class Action {
  constructor (docker, image) {
    this.docker = docker
    this.image = image
    this.container = null
    this.http_port = 8080
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
          resolve()
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

  invoke (parameters) {
    if (!this.container) {
      return Promise.reject('Unable to invoke Action without active container.')
    }

    return this.http_post(this.http_url() + '/run', {value: parameters})
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

    return {ExposedPorts, PortBindings}
  }
}

module.exports = Action
