"use strict";

const Constants = require("../Constants");
const BaseModel = require("./BaseModel");

const BaseGuildMember = {
  id: null,
  guild_id: null,
  nick: null,
  roles: [],
  mute: false,
  deaf: false,
  self_mute: false,
  self_deaf: false,
  joined_at: "",
  user: null
};

class GuildMember extends BaseModel {
  constructor(def) {
    super(BaseGuildMember, def);
  }
}

module.exports = GuildMember;