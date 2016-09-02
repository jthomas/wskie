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
}

module.exports = BaseInvocation
