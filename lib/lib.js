'use strict';

const Joi     = require('joi');
const request = require('request');
const Promise = require('bluebird');
const { URL } = require('url');


const EventApi = require('./eventApi');

const internals = {};

internals.schema = Joi.object({
    url        : Joi.string().required(),
    access_key : Joi.string().required(),
    secret_key : Joi.string().required()
});

class RancherClient {
    constructor(config) {
        Joi.assert(config, internals.schema);
        this.config = config;
        
        if ((new URL(config.url)).protocol === 'https:') {
            this.config.enableSSL = true;
        }
        
        this.request  = request.defaults({
            baseUrl : `${config.url}`,
            headers : {
                Authorization  : `Basic ${new Buffer(`${config.access_key}:${config.secret_key}`).toString('base64')}`,
                'Content-Type' : 'application/json'
            }
        });
        this._request = (method, url, options) => new Promise((resolve, reject) => {
            this.request(url, Object.assign({
                method
            }, options), (err, res, json) => {
                if (err) {
                    return reject(err);
                }
                
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    const e      = new Error(`Invalid response code: ${res.statusCode}`);
                    e.statusCode = res.statusCode;
                    e.headers    = res.headers;
                    return reject(e);
                }
                
                return resolve(typeof json === 'string' ? JSON.parse(json) : json);
            });
        });
    }
    
    createContainer(container) {
        return this._request('POST', '/container', {
            json : container
        });
    }
    
    getContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('GET', `/container/${containerId}`);
    }
    
    updateContainer(container) {
        return this._request('POST', `/container/${container.id}`, {
            json : container
        });
    }
    
    stopContainer(containerId, stopParams) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('POST', `/container/${containerId}/?action=stop`, {
            json : stopParams
        });
    }
    
    startContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('POST', `/container/${containerId}/?action=start`);
    }
    
    restartContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('POST', `/container/${containerId}/?action=restart`);
    }
    
    removeContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('DELETE', `/container/${containerId}`);
    }
    
    purgeContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('POST', `/container/${containerId}/?action=purge`);
    }
    
    getContainerLogs(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('POST', `/container/${containerId}/?action=logs`);
    }
    
    createStack(stack) {
        return this._request('POST', '/stacks', {
            json : stack
        });
    }
    
    getStacks(query) {
        return new Promise((resolve, reject) => {
            this._request('GET', `/stacks?${query}`).then(resp => {
                resolve(resp.data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    
    getStack(stackId) {
        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('GET', `/stacks/${stackId}`);
    }
    
    getStackServices(stackId) {
        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('GET', `/stacks/${stackId}/services`);
    }
    
    removeStack(stackId) {
        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('POST', `/stacks/${stackId}/?action=remove`);
    }
    
    getPorts() {
        return this._request('GET', '/ports');
    }
    
    getHosts(query) {
        return new Promise((resolve, reject) => {
            this._request('GET', `/hosts?${query}`).then(resp => {
                resolve(resp.data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    
    getHost(hostId) {
        return this._request('GET', `/hosts/${hostId}`);
    }
    
    deleteHost(hostId) {
        return this._request('DELETE', `/hosts/${hostId}`);
    }
    
    evacuateHost(hostId) {
        return this._request('POST', `/hosts/${hostId}/?action=evacuate`);
    }
    
    getRegistrationToken() {
        return new Promise((resolve, reject) => {
            this._request('POST', '/registrationtokens').then(resp => {
                this._request('GET', `/registrationtokens/${resp.id}`).then(resp => {
                    resolve(resp.command);
                }).catch(err => {
                    reject(err);
                });
            }).catch(err => {
                reject(err);
            });
        });
    }
    
    getServices(query) {
        return new Promise((resolve, reject) => {
            this._request('GET', `/services?${query}`).then(resp => {
                resolve(resp.data);
            }).catch(err => {
                reject(err);
            });
        });
    }
    
    getService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('GET', `/services/${serviceId}`);
    }
    
    getServiceStats(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('GET', `/services/${serviceId}/containerstats`);
    }
    
    stopService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/services/${serviceId}/?action=deactivate`);
    }
    
    startService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/services/${serviceId}/?action=activate`);
    }
    
    createService(service) {
        return this._request('POST', '/services', {
            json : service
        });
    }
    
    restartService(serviceId, restartParams) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/services/${serviceId}/?action=restart`, {
            json : restartParams
        });
    }
    
    upgradeService(serviceId, upgradeParams) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/services/${serviceId}/?action=upgrade`, {
            json : upgradeParams
        });
    }

    cancelUpgradeService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/services/${serviceId}/?action=cancelupgrade`);
    };

    rollbackService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/services/${serviceId}/?action=rollback`);
    };
    
    finishUpgradeService(serviceId) {
        return this._request('POST', `/services/${serviceId}?action=finishupgrade`);
    }
    
    deleteService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('DELETE', `/services/${serviceId}`);
    }
    
    createLoadBalancer(createParams) {
        return this._request('POST', '/loadBalancerServices', {
            json : createParams
        });
    }
    
    deleteLoadBalancer(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('DELETE', `/loadBalancerServices/${serviceId}`);
    }
    
    updateLoadBalancer(serviceId, updateParams) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('PUT', `/loadBalancerServices/${serviceId}`, {
            json : updateParams
        });
    }
    
    upgradeLoadBalancer(serviceId, upgradeParams) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=upgrade`, {
            json : upgradeParams
        });
    }
    
    activateLoadBalancer(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=activate`);
    }
    
    addServiceLinkLoadBalancer(serviceId, params) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=addservicelink`, {
            json : params
        });
    }
    
    cancelUpgradeLoadBalancer(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=cancelupgrade`);
    }
    
    continueUpgradeLoadBalancer(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=continueupgrade`);
    }
    
    deactivateLoadBalancer(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=deactivate`);
    }
    
    finishUpgradeLoadBalancer(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=fnishupgrade`);
    }
    
    removeServiceLinkLoadBalancer(serviceId, params) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=removeservicelink`, {
            json : params
        });
    }
    
    rollbackLoadBalancer(serviceId, params) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('POST', `/loadBalancerServices/${serviceId}/?action=rollback`);
    }
    
    createVolume(volume) {
        return this._request('POST', '/volume', {
            json : volume
        });
    }
    
    getVolume(volumeId) {
        Joi.assert(volumeId, Joi.string().required(), 'Must specify volumeId');
        return this._request('GET', `/volume/${volumeId}`);
    }
    
    removeVolume(volumeId) {
        Joi.assert(volumeId, Joi.string().required(), 'Must specify volumeId');
        return this._request('POST', `/volume/${volumeId}/?action=remove`);
    }
    
    getCertificates() {
        return this._request('GET', '/certificates');
    }
    
    getVolumes() {
        return this._request('GET', '/volumes?limit=0');
    }
    
    EventApi() {
        return new EventApi(this.config);
    }
}

module.exports = RancherClient;
