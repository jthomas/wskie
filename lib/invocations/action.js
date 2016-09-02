'use strict'

const BaseInvocation = require('./base')

class ActionInvocation extends BaseInvocation {
  constructor (openWhiskClient, actionName, parameters) {
    super(parameters)
    this.client = openWhiskClient
    this.actionName = actionName
  }

  retrieveActionSource () {
    return this.client.actions.get({actionName: this.actionName})
      .then(result => result.exec.code)
  }
}

module.exports = ActionInvocation
