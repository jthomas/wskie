'use strict'

const fs = require('fs')
const BaseInvocation = require('./base')

class LocalInvocation extends BaseInvocation {
  constructor (sourcePath) {
    super()
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
}

module.exports = LocalInvocation
