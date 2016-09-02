'use strict'

const LocalInvocation = require('./invocations/local')

class InvocationBuilder {
  constructor (actionIdentifier, parameters) {
    this.actionIdentifier = actionIdentifier
    this.parameters = parameters
  }

  invocation () {
    if (this.actionIdentifier.endsWith('\.js')) {
      return new LocalInvocation(this.actionIdentifier, this.parseParameters())
    }

    throw new Error('Unsupported file extension for Action, must be .js')
  }

  parseParameters () {
    const parsed = {}
    this.parameters.forEach(param => {
      const split = param.indexOf('=')
      if (split === -1) return

      const value = param.slice(split + 1)
      parsed[param.slice(0, split)] = param.slice(split + 1)
    })
    return parsed
  }
}

module.exports = InvocationBuilder
