"use strict"

let EventEmitter;
try {
	EventEmitter = require("eventemitter3");
} catch(err) { // eslint-disable no-empty
	EventEmitter = require("events").EventEmitter;
}

const
	Revsil = require("./gateway/Revsil");


class RevsilHandler extends EventEmitter {
	constructor(token, options) {
		super();
		if(!token) {
			throw new Error("You have not passed a token.");
		}
		this.token = token;
		
        this.options = Object.assign({
			baseURL: "https://api.revolt.chat",
        }, options);
		this.revsil = new Revsil(this, token);
		this.connect = this.connect.bind(this);
		
	}
	async connect() {
		this.revsil.connect();
	}

}

exports.RevsilHandler = RevsilHandler;