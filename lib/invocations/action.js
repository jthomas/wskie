'use strict'

const BaseInvocation = require('./base')

class ActionInvocation extends BaseInvocation {
  constructor (openWhiskClient, actionName, parameters) {
    super(parameters)
    this.client = openWhiskClient
    this.actionName = actionName
  }

  retrieveActionSource () {
    return this.client.actions.get(this.getActionParams())
      .then(result => result.exec.code)
  }

  invocationId () {
    return this.actionName
  }

  invocationType () {
    return 'remote openwhisk action'
  }

  getActionParams () {
    if (!this.actionName.includes('/')) {
      return {actionName: this.actionName}
    }

    // handle action identifier with namespace in the following forms:
    // 1. namespace/action_id
    // 2. /namespace/action_id
    const actionId = this.actionName.split('/').filter(a => !!a)
    return {namespace: actionId[0], actionName: actionId[1]}
  }
}

module.exports = ActionInvocation
