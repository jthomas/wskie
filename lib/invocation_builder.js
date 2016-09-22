'use strict'

const LocalInvocation = require('./invocations/local')
const ActionInvocation = require('./invocations/action')
const Credentials = require('./credentials.js')
const openwhisk = require('openwhisk')

class InvocationBuilder {
  constructor (actionIdentifier, parameters) {
    this.actionIdentifier = actionIdentifier
    this.parameters = parameters
  }

  invocation () {
    if (this.actionIdentifier.endsWith('\.java') ||
        this.actionIdentifier.endsWith('\.py')) {
      throw new Error('Unsupported file extension for Action, must be .js')
    }

    if (this.actionIdentifier.endsWith('\.js')) {
      return Promise.resolve(new LocalInvocation(this.actionIdentifier, this.parseParameters()))
    }

    return this.createActionInvocation()
  }

  createActionInvocation () {
    return this.openWhiskClientFactory().then(client => {
      return new ActionInvocation(client, this.actionIdentifier, this.parseParameters())
    })
  }

  openWhiskClientFactory () {
    return Credentials.getWskProps().then(props => {
      const Params = ['apihost', 'auth', 'namespace']
      Params.forEach(p => {
        if (!props.hasOwnProperty(p)) throw new Error('Missing OpenWhisk credentials in .wskprops or environment variables. Unable to access Action source without these parameters.')
      })

      return openwhisk({api: `https://${props.apihost}/api/v1/`, api_key: props.auth, namespace: props.namespace})
    })
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
