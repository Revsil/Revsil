let
	Revsil = require("./revsil"),
	util = require("util"),
	humanize = require("humanize");
	

function codeblock(text) {
	return `\`\`\`js\n${text}\n\`\`\``;
}

class TestBot {
	constructor() {
		this.revsil = new Revsil("", {shards: 1, sharding: false});
		this.revsil.shards.map(shard => {
			this.handleRevolt(this.revsil.shards.get(shard.id));
		})
	}
	
	canRun(sender) {
		if([""].includes(sender)) {
			return true;
		}
		return false;
	}
	
	handleRevolt(m) {
		
		m.on("raw", event => {
			//console.log("raw", event);
		});
		
		m.on("debug", event => {
			//console.log(event);
		});
		
		m.on("onGuildCreate", guild => {
			//console.log(guild.members);
		});
		
		m.on("ClientReady", () => {
			console.log("i\'m ready");
		});
		
		m.on("onMessage", async msg => {
			if(msg.author.bot) {
				return;
			}
			//console.log(msg);
			//const pretty = util.format(msg.author.username, msg.content);
			//console.log(pretty);
			if(msg.content[0] == "!") {
				let body = msg.content.slice(1).split(" ");
				let cmd  = body[0];
				let args = body.slice(1).join(" ");
				
				
				if(cmd == "rt") {
					let stamp = process.uptime();
					let now = Math.floor(Date.now() / 1000);
					m.createMessage(msg.channel, humanize.relativeTime(now - stamp))
				}
				
				if(cmd == "eval" && this.canRun(msg.author)) {
					let output;
					try {
						const
							evaled = eval(args),
							res = util.inspect(evaled, { depth: 1 });
							output = "\n" + codeblock(res);
					} catch(e) {
						output = "\n" + codeblock(e);
					}
					m.createMessage(msg.channel, output);
				}
			}
		})
	}
}

x = new TestBot();
x.revsil.connect();