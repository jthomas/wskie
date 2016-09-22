const Docker = require('dockerode')
const Action = require('./action.js')
const DefaultImage = 'nodejsaction'
const Credentials = require('./credentials.js')

const DEFAULT_HOST = 'openwhisk.ng.bluemix.net'
const DEFAULT_KEY = 'missing'

const create = () => {
  return Credentials.getWskProps().then(WskProps => {
    const AUTH_KEY = WskProps.auth || DEFAULT_KEY
    const EDGE_HOST = WskProps.apihost || DEFAULT_HOST
    return new Action(new Docker(), DefaultImage, {AUTH_KEY, EDGE_HOST})
  })
}

module.exports = {
  create
}
