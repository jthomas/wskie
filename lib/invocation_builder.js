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
    return this.parameters.reduce((parsed, param) => {
      const paramKeyValue = this.parseParamKeyValue(param)
      if (paramKeyValue) {
        parsed[paramKeyValue.key] = this.parseParamValue(paramKeyValue.value)
      }

      return parsed
    }, {})
  }

  parseParamKeyValue (paramKeyValue) {
    const split = paramKeyValue.indexOf('=')
    if (split === -1) return null

    return { key: paramKeyValue.slice(0, split), value: paramKeyValue.slice(split + 1) }
  }

  // support parsing JSON array and object parameter values.
  // we just try to parse out some valid JSON and fall back to
  // the string value if it fails.
  parseParamValue (paramValue) {
    try {
      paramValue = JSON.parse(paramValue)
    } catch (err) {
    }

    return paramValue
  }
}

module.exports = InvocationBuilder
