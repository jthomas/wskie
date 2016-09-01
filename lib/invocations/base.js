'use strict'

class BaseInvocation {
  retrieveActionSource () {
    return Promise.resolve('')
  }

  retrieveParameters () {
    return Promise.resolve({})
  }
}

module.exports = BaseInvocation
