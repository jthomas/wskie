'use strict'

const fs = require('fs')

class LocalInvocation {
  constructor (sourcePath) {
    this.sourcePath = sourcePath
  }

  retrieveActionSource () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.sourcePath, 'utf8', (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  retrieveParameters () {
    return {}
  }
}

module.exports = LocalInvocation
