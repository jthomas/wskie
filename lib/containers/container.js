class Container {
  constructor (docker, id) {
    this.docker = docker
    this.id = id
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
}

module.exports = Container
