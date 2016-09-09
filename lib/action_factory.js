const Docker = require('dockerode')
const Action = require('./action.js')
const DefaultImage = 'nodejsaction'

const create = () => {
  return new Action(new Docker(), DefaultImage)
}

module.exports = {
  create
}
