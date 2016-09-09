const console = require('console')
const InvocationBuilder = require('../invocation_builder.js')
const ActionFactory = require('../action_factory.js')

const Invoke = (id, params) => {
  return new Promise((resolve, reject) => {
    console.log(`invoking action from local file: ${id}`)
    const invocationBuilder = new InvocationBuilder(id, params)
    const invocation = invocationBuilder.invocation()
    const action = ActionFactory.create()

    invocation.retrieve().then(instance => {
      return action.start()
        .then(() => action.source(instance.source))
        .then(() => action.invoke(instance.parameters))
        .then(result => {
          console.log(JSON.stringify(result, null, 2))
          action.stop()
        })
        .then(() => resolve())
        // what about fails....
    })
    .catch(err => {
      const errMsg = '❌ Oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?'
      console.log(errMsg, err)
      reject('invoke failed')
    })
  })
}

module.exports = Invoke
