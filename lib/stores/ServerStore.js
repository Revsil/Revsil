"use strict";

class ServerStore {
    constructor() {
        this.servers = [];
    }
    
    add(server) {
        this.servers.push(server);
    }
    
    has(server) {
        return this.servers.map(g => g._id == server).includes(true);
    }
    
    size() {
        return this.servers.length;
    }
    
    getAll() {
        return this.servers.map(g => g);
    }
        
    get(server) {
        for(let guid of this.servers) {
            if(guid._id == server) {
                return  guid;
            }
        }
    }
};


exports.ServerStore = ServerStore;
