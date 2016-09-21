const Docker = require('dockerode')
const Action = require('./action.js')
const DefaultImage = 'nodejsaction'
const Credentials = require('./credentials.js')

const DEFAULT_HOST = 'openwhisk.ng.bluemix.net'
const DEFAULT_KEY = 'missing'

const create = () => {
  return Credentials.getWskProps().then(WskProps => {
    const EDGE_HOST = `EDGE_HOST=${WskProps.apihost || DEFAULT_HOST}:443` 
    const AUTH_KEY = `AUTH_KEY=${WskProps.auth || DEFAULT_KEY}`
    return new Action(new Docker(), DefaultImage, [EDGE_HOST, AUTH_KEY])
  })
}

module.exports = {
  create
}
