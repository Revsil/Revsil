const
	 Server = require("../models/Server"),
	 Role = require("../models/Role"),
	 Message = require("../models/Message"),
	 User = require("../models/User"),	 
	 Member = require("../models/Member"),
	 GuildMember = require("../models/GuildMember"),
	 Constants = require("../Constants"),
	 VerificationLevel = Constants.VerificationLevel,
	 UserNotificationSettings = Constants.UserNotificationSettings,
	 MFALevels = Constants.MFALevels,
	 ServerStore = require("../stores/ServerStore").ServerStore,
	 WebSocket = require("ws"),
	 fetch = require('node-fetch'),
	 {API} = require("revolt-api");

let EventEmitter;
try {
	EventEmitter = require("eventemitter3");
} catch(err) { // eslint-disable no-empty
	EventEmitter = require("events").EventEmitter;
}


function convertRoles(roles) {
	const map = new Map();
	roles.forEach(role => {
		map.set(role.id, new Role(role));
	});
	return map;
}
	

class Revsil extends EventEmitter {
	constructor(client, token) {
		super();
		this.userAgent = `Revsil (https://github.com/Revsil/Revsil, ${require("../../../package.json").version})`;
		this._token = token;
		this.client = client;
		this.status = "";
		this.seq = 0;
		this._servers = new ServerStore();
		this.ready = {};
		this.headers = {"headers": {"authenication": " revolt " + this._token ,'User-Agent': this.client.options.baseURL}};
		this.revoltAPI = new API({authentication: { revolt: this._token}, baseURL: this.client.options.baseURL});

	}

	async getGateWay() {
		this.status = "connecting";
		try {
			fetch(this.client.options.baseURL, {method: 'GET', headers: this.headers.headers})
			.then(res => res.json())
			.then(async res => {
				this._gatewayURL = `${res.ws}`;
				await this._connect();
			});
		} catch(err){ 
			this.emit("error", err.name)
		};
	};

	
	async connect() {
		this.emit("connected");
		await this.getGateWay();
	}
		
	async _connect() {
		this.ws = new WebSocket(this._gatewayURL);
		await this._handleWebsocketDataStream();
	}

	async _loginToRevolt() {
        const ids = {
			type: "Authenticate",
            token: this._token,
        };
		this.configuration = await this.revoltAPI.get('/');
		this.sendWS(2, ids, true);
	}

	_handleGuildMemberChunk(guild) {
		guild.members.map(member => {
			const m = new GuildMember({
				id: new User(member.user).id,
				guild_id: guild.guild_id,
				nick: member.nick,
				roles: member.roles,
				mute: member.mute,
				joined_at: member.joined_at,
				user: new User(member.user)
			})
			this.getGuild(guild.guild_id).members.push(m);
		})

	}
	
	_createGuild(guild) {
		const members = [];
		guild.members.map(member => {
			const m = new GuildMember({
				id: new User(member.user).id,
				guild_id: guild.id,
				nick: member.nick,
				roles: member.roles,
				mute: member.mute,
				joined_at: member.joined_at,
				user: new User(member.user)
			})
			members.push(m);
		})
		return new Guild({
			id: guild.id,
			name: guild.name,
			region: guild.region,
			icon: guild.icon,
			splash: guild.splah,
			features: new Set(guild.features),
			emojis: (guild.emojis != null ? guild.emojis : old.emojis) || [],
			default_message_notifications:
				guild.default_message_notifications || UserNotificationSettings.ALL_MESSAGES,
			owner_id: guild.owner_id,
			members: members,
			roles: convertRoles(guild.roles),
			afk_channel_id: guild.afk_channel_id,
			afk_timeout: guild.afk_timeout,
			verification_level: guild.verification_level || VerificationLevel.NONE,
			member_count:
			  (guild.member_count != null ? guild.member_count : old.member_count),
			large: (guild.large != null ? guild.large : old.large) || false,
			mfa_level: guild.mfa_level || MFALevels.NONE,
			joined_at: guild.joined_at || old.joined_at
		});
	}

	_ready(_data) {
		_data.guilds.map(guild => {
			this._ready[guild.id] = true;		
			this._requestGuildMembers(guild.id);
			//this._requestGuildSync(guild.id);

			const GuildObject = this.getGuild(guild.id);
			this.emit("guildReady", GuildObject);
		});
	}

	getServer(server) {
		if(this._servers.has(server)) {
			return this._servers.get(server);
		}
		return false;
	}

	async createMessage(dest, msg, embed) {
		embed = embed || null;
		let payload = {}
		if (msg) {
			payload['content'] = msg	
		}
		if(embed) {
			payload['embed'] = embed
		}
		msg = msg.replace(/@everyone/g, "@\u200beveryone").replace(/@here/g, "@\u200bhere");
		this.headers.headers["Content-type"] = "application/json";
		this.headers.headers["Accept"] = "application/json";
		this.headers.headers["Accept-Charset"] = "utf-8";
		this.revoltAPI.post(`/channels/${dest}/messages`, payload);
	}


	async get_user(u) {
		const user = await this.revoltAPI.get("/users/" + u);
		if(user) {
			return user;
		};
	};

	async get_message(c, mid) {
		const message = await this.revoltAPI.get(`/channels/${c}/messages/${mid}`);
		if(message) {
			return message;
		};
	};


	async get_members(sid) {
		const members = await this.revoltAPI.get(`/servers/${sid}/members`);
		if(members) {
			return members;
		};
	};



	heartbeat(normal) {
		if(normal && !this.lastHeartbeatAck) {
			//
		}
		this.lastHeartbeatAck = false;
		this.lastHeartbeatSent = new Date().getTime();
		const datas = {
			type: "Ping",
			data: +new Date(),
		}
		this.sendWS(1, datas, true);
	};

    _requestGuildSync(guildID) {
        this.sendWS(12, guildID);
	}
	
	_getGuildMembers(guildID, ChunkCount) {
		if(this._ready[guildID]) {
			this._requestGuildMembers([guildID]);
		}
		
	}

	_requestGuildMembers(guild, query, limit) {
		this.sendWS(8, {
			guild_id: guild,
			query: query || "",
			limit: limit || 0,
		})
	}


    sendWS(op, _data) {
        if(this.ws && this.ws.readyState === WebSocket.OPEN) {
            let i = 0;
            let waitFor = 1;
            const func = () => {
                if(++i >= waitFor && this.ws && this.ws.readyState === WebSocket.OPEN) {
					const data = JSON.stringify(_data);
                    this.ws.send(data);
                    this.emit("debug", JSON.stringify(_data));
                }
			};
			func();
		}
	}
	wsEvent(packet) {
		switch(packet.type) {
			case "Message": {
				const msg = new Message(packet);
				this.emit("onMessage", msg);
				break;
			}
			case "GUILD_CREATE": {
				const guild = this._createGuild(packet.d);
				this._guildMap.add(guild);
				this.emit("onGuildCreate", guild);
				break;
			}
			case "GUILD_MEMBERS_CHUNK": {
				this._handleGuildMemberChunk(packet.d);
				break;
			}
			
		}
	}

	async onWSMessage(packet) {
		this.emit("raw", packet, this.id);
        if(packet.s) {
            if(packet.s > this.seq + 1 && this.ws && this.status !== "resuming") {
                this.emit("warn", `Non-consecutive sequence (${this.seq} -> ${packet.s})`, this.id);
            }
            this.seq = packet.s;
		}

		switch(packet.type) {
			case Constants.Events.MESSAGE: {
				this.wsEvent(packet);
				break;
			}
			
			case Constants.Events.AUTHENTICATED: {
				if(this.heartbeatInterval) {
					clearInterval(this.heartbeatInterval);
				}
				this.heartbeatInterval = setInterval(() => this.heartbeat(true), 3_0000);
				this.heartbeat();
				break;

			}

			case Constants.Events.READY: {
				this.emit("ClientReady", {});
				for(const serv of packet.servers) {
					const server = new Server(serv);
					this._servers.add(server);
					
				}

				for(const mem of packet.members) {;
					const member = new Member(mem);
					const server = this._servers.get(member._id.server);
					server.members[member._id.user] =  member;
				}

				for(const s of this._servers.getAll()) {
					const data = await this.get_members(s._id);
					const server = this._servers.get(s._id);
					for(let u of data.users) {
						const user = new User(u);
						server.users[user._id] = user;
					}
					for(const m of data.members) {
						const member = new Member(m);
						const server = this._servers.get(member._id.server);
						server.members[member._id.user] =  member;


					}

				}

				break;
			}
			
			case Constants.Events.PONG: {
				this.lastHeartbeatAck = true;
				this.lastHeartbeatReceived = new Date().getTime();
				this.socketPing = new Date().getTime() - packet.data;
				break;
			}


		}
	}


	async _handleWebsocketDataStream() {
		this.ws.onopen = () => {
			this.lastHeartbeatAck = true;
			this.status = "handshaking";
			this.emit("connect", {});
			this._loginToRevolt();
		}

		this.ws.onmessage = async (m) => {
			let {data} = m;
			await this.onWSMessage(JSON.parse(data.toString()));
		}

		this.ws.onerror = (error) => {
			console.log(error);
		}

		this.ws.onclose = (event) => {
			console.log(`[WS] Closed with reason: ${event.reason}, code: ${event.code}`);
		}
	}

};

module.exports = Revsil;