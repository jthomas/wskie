const Action = require('./lib/action')
const Docker = require('dockerode')

const action = new Action(new Docker(), 'nodejsaction')


const docker = new Docker()
//action.start().then(() => console.log('success')).catch(err => console.log('failed', err))
//
HostConfig = {PortBindings: { "8080/tcp": [{ "HostPort": "" }] }}
docker.run('nodejsaction', [], process.stdout, {ExposedPorts: {"8080/tcp": {}}, HostConfig},function (err, data, container) {
  console.log(err, data);
}).on('container', (container) => {
  console.log(container)
})
