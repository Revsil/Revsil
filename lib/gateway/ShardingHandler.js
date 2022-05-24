"use strict";

const 
	Collection = require("../util/Collection"),
	Revsil = require("./Revsil");
	
class ShardingHandler extends Collection {
		constructor(client) {
		super(Revsil);
		this._client = client;
		this.conQ = [];
		this.lastCon = 0;
		this.conTimeOut = null;
	}
	
	_readyPacket() {
		this.lastCon = Date.now();
		this._tryConn();
	}

	connect(shard) {
		if(this.lastCon <= Date.now() - 5000 && !this.find((shard) => shard.connecting)) {
			shard.connect();
			this.lastCon = Date.now();
		} else {
			this.conQ.push(shard);
			this._tryConn();
		}
	}
	
	_tryConn() {
		if(this.conQ.length > 0) {
			if(this.lastCon <= Date.now() - 500 && !this.find((shard) => shard.connecting)) {
				const shard = this.conQ.shift();
				shard.connect();
				this.lastCon = Date.now() + 7500;
			} else {
				 if(!this.conTimeOut) {
					 this.conTimeOut = setTimeout(() =>  {
						this.conTimeOut = null;
						this._tryConn();

					 }, 1000);
				}
			}
		}
	}

	_spawn(id) {
		//
		let shard = this.get(id);
		if(!shard) {
			shard = this.add(new Revsil(id, this._client));
			shard.on("connected", () => {
				this._client.emit("shardReady", shard.id);
			})
			
		}
	}
						 
}


module.exports = ShardingHandler;