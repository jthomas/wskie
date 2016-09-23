const console = require('console')
const ActionFactory = require('../action_factory.js')
const Spinner = require('cli-spinner').Spinner
const chalk = require('chalk')

const Reinvoke = (id, params) => {
  return new Promise((resolve, reject) => {
    const spinner = new Spinner()
    ActionFactory.create().then(action => {
      const invocationBuilder = new InvocationBuilder(id, params)
      return invocationBuilder.reinvocation().then(invocation => {
        spinner.setSpinnerTitle(chalk.green(`invoking action from ${invocation.invocationType()}: ${chalk.bold(invocation.invocationId())} %s`))
        spinner.setSpinnerString(20)
        spinner.start()
        return invocation.retrieve().then(instance => {
          return action.start()
          .then(() => action.source(instance.source))
          .then(() => action.invoke(instance.parameters))
          .then(result => {
            spinner.stop(true)
            console.log(chalk.green(`invoking action from ${invocation.invocationType()}: ${chalk.bold(invocation.invocationId())}`))
            console.log(chalk.blue(`-- result --`))
            console.log(JSON.stringify(result, null, 2))
            action.stop()
          })
          .then(() => resolve())
        })
      })
      .catch(err => {
        spinner.stop(true)
        // console.log(chalk.green(`invoking action from ${invocation.invocationType()}: ${chalk.bold(invocation.invocationId())}`))
        const errMsg = 'oh dear, there has been a problem invoking your action. Maybe these logs can help you resolve it?\n'
        console.log(chalk.red.bold(errMsg))
        console.log(err)
        reject('invoke failed')
        action.stop()
      })
    })
  })
}

module.exports = Reinvoke
