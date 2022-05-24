"use strict"

let EventEmitter;
try {
	EventEmitter = require("eventemitter3");
} catch(err) { // eslint-disable no-empty
	EventEmitter = require("events").EventEmitter;
}

const
	ShardingHandler = require("./gateway/ShardingHandler");


class RevsilHandler extends EventEmitter {
	constructor(token, options) {
		super();
		if(!token) {
			throw new Error("You have not passed a token.");
		}
		this.token = token;
        this.options = Object.assign({
            shards: 1,
			baseURL: "https://api.revolt.chat",
            sharding: false,
        }, options);
		this.shards = new ShardingHandler(this);
		this.run();
		this.connect = this.connect.bind(this);
		
	}
	
	run() {
		if(this.options.sharding && this.options.shards > 1) {
			for(let i = 0; i < this.options.shards; i++) {
				this.shards._spawn(i);
			}
		} else {
			this.shards._spawn(this.options.shards);
		}
	}
	
	async connect() {
		for(let shard of this.shards) {
			this.shards.get(shard[0]).connect();
		}
	}

}

exports.RevsilHandler = RevsilHandler;