const EventEmitter = require('promise-events');

const WebSocket = require('ws');

class ApiEvent extends EventEmitter {
    constructor({ url, access_key, secret_key, enableSSL = false }) {
        super();
        
        this.auth     = '';
        this.protocol = enableSSL ? 'wss' : 'ws';
        
        if (access_key && secret_key) {
            this.auth = `${access_key}:${secret_key}@`;
        }
        
        this.url = `${this.protocol}://${this.auth}${url.replace(/(^\w+:|^)\/\//, '')}/subscribe?eventNames=resource.change`;
        
        this.socket = new WebSocket(this.url, [], {});
        
        this.socket.on('message', message => {
            try {
                const json = JSON.parse(message);
                
                if (json.name === 'ping') {
                    this.emit(json.name, json);
                    return;
                }
                
                const events = [json.name];
                
                if (json.resourceType) {
                    events.push(json.resourceType);
                }
                
                if (json.resourceId) {
                    events.push(json.resourceId);
                }
                
                const alternativeFilters = [];
                
                if (json.data.resource.transitioning === 'yes') {
                    alternativeFilters.push('transitioning');
                } else {
                    if (json.data.resource.state) {
                        alternativeFilters.push(json.data.resource.state);
                    }
                }
                
                events.forEach((event, index) => {
                    const baseEvent = events.slice(0, index + 1).join('.');
                    
                    this.emit(baseEvent, json);
                    
                    alternativeFilters.forEach(filter => {
                        this.emit(`${baseEvent}.${filter}`, json);
                    });
                });
            } catch (error) {
                this.emit('error', { error, message });
            }
        });
    }
    
    pause() {
        this.socket.pause();
    }
    
    resume() {
        this.socket.resume();
    }
    
    stop(status = 200) {
        this.socket.stop(status);
    }
}

module.exports = ApiEvent;
