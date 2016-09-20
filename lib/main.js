const program = require('commander')
const Invoke = require('./commands/invoke.js')

program
  .command('invoke <id> [params...]')
  .description('invoke local file or remote action')
  .action(function (id, params) {
    console.log(id, params)
    Invoke(id, params)
  })

program.parse(process.argv)
