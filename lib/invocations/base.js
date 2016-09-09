'use strict'

class BaseInvocation {
  constructor (parameters) {
    this.parameters = parameters
  }

  retrieveActionSource () {
    return Promise.resolve('')
  }

  retrieveParameters () {
    return Promise.resolve(this.parameters)
  }

  retrieve () {
    return Promise.all([this.retrieveActionSource(), this.retrieveParameters()])
      .then(results => ({source: results[0], parameters: results[1]}))
  }
}

module.exports = BaseInvocation
