"use strict";

const BaseModel = require("./BaseModel");

const BaseGuild = {
  id: null,
  name: null,
  owner_id: null,
  icon: null,
  splash: null,
  features: new Set(),
  emojis: [],
  default_message_notifications: 0,
  roles: new Map(),
  afk_channel_id: null,
  afk_timeout: null,
  verification_level: 0,
  region: null,
  member_count: 0,
  large: false,
  mfa_level: 0,
  joined_at: "",
  members: null
};

class Guild extends BaseModel {
  constructor(def) {
    super(BaseGuild, def);
  }
}

module.exports = Guild;
