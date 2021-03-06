'use strict'

const fs = require('fs')
const BaseInvocation = require('./base')

class LocalInvocation extends BaseInvocation {
  constructor (sourcePath, parameters) {
    super(parameters)
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

  invocationId () {
    return this.sourcePath
  }

  invocationType () {
    return 'local file'
  }
}

module.exports = LocalInvocation
