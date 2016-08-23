class Action {
  constructor (image, client) {
    this.image = image
    this.client = client
  }

  start () {
    return new Promise((resolve, reject) => {
      this.client.run(this.image, [], process.stdout, (err, data, container) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

module.exports = Action
