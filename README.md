# node-rancher-api
Node client for the Rancher API

## Client

An API client is included in this package

```js
const Rancher = require('rancher-node');

const rancher = new Rancher({
    url: 'https://try.rancher.com/v2-beta/projects/XXXXXXXX/',
    access_key: 'SoMeToKeN',
    secret_key: 'someSecRetToken'
});

rancher.getContainer(containerId).then((container) => {
  // gets the container for the provided container id
}).catch((err)=>{
  console.error(' ERROR : ', err)
});
```

## API

### `createContainer(container)`

Creates a container

### `getContainer(containerId)`

Gets information about a specific container

### `updateContainer(container)`

Updates a container

### `stopContainer(containerId, stopParams)`

Stops a container

### `startContainer(containerId)`

Starts a container

### `restartContainer(containerId)`

Restarts a container

### `removeContainer(containerId)`

Removes a container

### `purgeContainer(containerId)`

Purges a container

### `getContainerLogs(containerId)`

Gets the container logs of a container

### `createStack(stack)`

Creates a stack

### `getStacks(query)`

Gets all stacks

### `getStack(stackId)`

Gets information about a specific stack

### `getStackServices(stackId)`

Gets the stack services of a stack

### `removeStack(stackId)`

Removes a stack

### `getPorts()`

Gets all ports

### `getHosts(query)`

Gets all hosts

### `getHost(hostId)`

Gets information about a specific host

### `deleteHost(hostId)`

Deletes a host

### `getRegistrationToken()`

Gets information about a specific registration token

### `getServices(query)`

Gets all services

### `getService(serviceId)`

Gets information about a specific service

### `getServiceStats(serviceId)`

Gets the service stats of a service

### `stopService(serviceId)`

Stops a service

### `startService(serviceId)`

Starts a service

### `restartService(serviceId, restartParams)`

Restarts a service

### `createService(serviceId)`

Creates a service

### `upgradeService(serviceId, upgradeParams)`

Upgrades a service

### `cancelUpgradeService(serviceId)`

Cancels service upgrade

### `rollbackService(serviceId)`

Reverts service upgrade

### `createVolume(volume)`

Creates a volume

### `getVolume(volumeId)`

Gets information about a specific volume

### `removeVolume(volumeId)`

Removes a volume

## Event API

```js
const Rancher = require('@pixul/node-rancher-api');

const rancher = new Rancher({
    url: 'https://try.rancher.com/v2-beta/projects/XXXXXXXX/',
    access_key: 'SoMeToKeN',
    secret_key: 'someSecRetToken'
});

const eventApi = new Rancher.EventApi();

eventApi.on('error', err => {
    console.log(err);
});

eventApi.on('resource.change.host.1h874.active', event => {
    const hostId = event.data.resource.id;
});

eventApi.on('resource.change.host.1h874.transitioning', event => {
    const hostId = event.data.resource.id;
});

eventApi.on('resource.change.host.1h874.active.transitioning', event => { // Will never be trigger, never
    const hostId = event.data.resource.id;
});
```

### Event filters 

#### Basic

* `resource.change`
* `resource.change.<type>`
* `resource.change.<type>.<id>`

#### State filter

If the resource got a `state` attribute set and a `transitioning` value to `no`

* `resource.change.<state>`
* `resource.change.<type>.<state>`
* `resource.change.<type>.<id>.<state>`

### Transitioning resource

If the resource got `transitioning` set to `yes`

* `resource.change.transitioning`
* `resource.change.<type>.transitioning`
* `resource.change.<type>.<id>.transitioning`
