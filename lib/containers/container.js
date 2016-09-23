const request = require('request')

class Container {
  constructor (docker, id) {
    this.docker = docker
    this.id = id
    this.http_port = 8080
  }

  isRunning () {
    return this.getState().then(data => data.State.Running)
  }

  start () {
    return this.changeRunningState(true)
  }

  stop () {
    return this.changeRunningState(false)
  }

  getState () {
    return new Promise((resolve, reject) => {
      this.docker.getContainer(this.id).inspect((err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  changeRunningState (newRunningState) {
    return this.isRunning().then(currentRunningState => {
      if (newRunningState === currentRunningState) return Promise.resolve()

      const updateState = newRunningState ? 'start' : 'stop'

      return new Promise((resolve, reject) => {
        this.docker.getContainer(this.id)[updateState]((err, data) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }

  httpUrl () {
    return this.httpPortMapping().then(httpPort => {
      let ipAddr = httpPort.HostIp

      if (ipAddr === '0.0.0.0') {
        ipAddr = '127.0.0.1'
      }

      return `http://${ipAddr}:${httpPort.HostPort}`
    })
  }

  httpPortMapping () {
    return this.getState().then(data => {
      const NetSet = data.NetworkSettings
      const container_http_port = `${this.http_port}/tcp`

      if (!NetSet ||
          !NetSet.Ports ||
          !NetSet.Ports[container_http_port] ||
          !NetSet.Ports[container_http_port].length) {
        throw new Error('Exposed container ports does not include HTTP port.')
      }

      return NetSet.Ports[container_http_port][0]
    })
  }

  httpPortOpen (delay = 100, max_delay = 30000) {
    const errMsg = 'Timed out waiting for HTTP server to become available in container.'

    return this.isRunning().then(running => {
      if (!running) return Promise.reject(new Error('Container is not running'))

      return this.httpUrl().then(url => {
        let total_delay = 0
        const pollServer = (resolve, reject) => {
          request.get({url}, (err, resp, body) => {
            if (!err) return resolve()
            if (total_delay > max_delay) return reject(new Error(errMsg))
            total_delay += delay
            setTimeout(() => pollServer(resolve, reject), delay)
          })
        }

        return new Promise(pollServer)
      })
    })
  }
}

module.exports = Container
