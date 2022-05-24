"use strict";
const BaseModel = require("./BaseModel");

const BaseUser = {
  _id: null,
  username: "",
  avatar: null,
  relations: null,
  badges: null,
  status: null,
  relationship: null,
  online: false,
  flags: null,
  bot: null,
};

class User extends BaseModel {
  constructor(def) {
    super(BaseUser, def);
  }
}

module.exports = User;