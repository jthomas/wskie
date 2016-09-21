const console = require('console')
const InvocationBuilder = require('../invocation_builder.js')
const ActionFactory = require('../action_factory.js')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')

const Invoke = (id, params) => {
  return new Promise((resolve, reject) => {
    const spinner = new Spinner(chalk.green(`invoking action from local file: ${chalk.bold(id)} %s`))
    spinner.setSpinnerString(20)
    spinner.start()
    const invocationBuilder = new InvocationBuilder(id, params)
    const invocation = invocationBuilder.invocation()
    ActionFactory.create().then(action => {
      invocation.retrieve().then(instance => {
        return action.start()
        .then(() => action.source(instance.source))
        .then(() => action.invoke(instance.parameters))
        .then(result => {
          spinner.stop(true)
          console.log(chalk.green(`invoking action from local file: ${chalk.bold(id)}`))
          console.log(chalk.blue(`--`))
          console.log(JSON.stringify(result, null, 2))
          action.stop()
        })
        .then(() => resolve())
      })
      .catch(err => {
        spinner.stop(true)
        console.log(chalk.green(`invoking action from local file: ${chalk.bold(id)}`))
        const errMsg = 'oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n'
        console.log(chalk.red.bold(errMsg))
        console.log(err)
        reject('invoke failed')
        action.stop()
      })
    })
  })
}

module.exports = Invoke
