const PortBindings = (port) => {
  const PortBindings = {}
  PortBindings[TcpPort(port)] = [{ HostPort: '' }]
  return PortBindings
}

const ExposedPorts = (port) => {
  const ExposedPorts = {}
  ExposedPorts[TcpPort(port)] = {}
  return ExposedPorts
}

const TcpPort = (port) => `${port}/tcp`

const Env = (env) => Object.keys(env).map(key => `${key.toUpperCase()}=${env[key]}`)

const CreateConfig = (image, env, port) => ({
  Image: image, Env: Env(env), ExposedPorts: ExposedPorts(port), PortBindings: PortBindings(port)
})

const ContainersFactory = (docker) => {
  const create = (image, env, port) => {
    return new Promise((resolve, reject) => {
      docker.createContainer(CreateConfig(image, env, port), (err, container) => {
        if (err) return reject(err)
        resolve(container.id)
      })
    })
  }
  return {create}
}

module.exports = ContainersFactory
