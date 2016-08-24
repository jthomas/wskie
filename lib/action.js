'use strict'

const request = require('request')

class Action {
  constructor (docker, image) {
    this.docker = docker
    this.image = image
    this.container = null
  }

  start () {
    return new Promise((resolve, reject) => {
      this.docker.run(this.image, [], process.stdout, (err, data, container) => {
        if (err) return reject(err)
        this.container = container
        resolve()
      })
    })
  }

  source (action_source) {
    if (!this.container) {
      return Promise.reject('Unable to update Action source without active container.')
    }

    return new Promise((resolve, reject) => {
      const url = this.http_url() + '/init'
      const body = { value: { main: 'main', code: action_source }}

      request.post({ url, body, json: true }, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  invoke (parameters) {
    if (!this.container) {
      return Promise.reject('Unable to invoke Action without active container.')
    }
 
    return new Promise((resolve, reject) => {
      const url = this.http_url() + '/run'
      const body = { value: parameters }

      request.post({ url, body, json: true }, (err, msg, body) => {
        if (err) return reject(err)
        resolve(body)
      })
    })
  }

  http_url () {
    const httpPort = this.container.Ports
      .filter(port => port.PrivatePort === 80).pop()

    if (!httpPort) {
      throw new Error('Exposed container ports does not include HTTP port.')
    }

    let ipAddr = httpPort.IP

    if (ipAddr === '0.0.0.0') {
      ipAddr = '127.0.0.1'
    }

    return `http://${ipAddr}:${httpPort.PublicPort}`
  }
}

module.exports = Action
