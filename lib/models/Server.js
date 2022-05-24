"use strict";

const BaseModel = require("./BaseModel");

const BaseServer = {   
  _id: null,
  owner: null,
  name: null,
  description: null,
  channels: null,
  categories: null,
  system_messages: null,
  roles: null,
  default_permissions: null,
  icon: null,
  banner: null,
  members: {},
  users: {},
};

class Server extends BaseModel {
  constructor(def) {
    super(BaseServer, def);
  }
}

module.exports = Server;