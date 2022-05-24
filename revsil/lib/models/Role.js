"use strict";

const BaseModel = require("./BaseModel");

const BaseRole = {
  id: null,
  name: null,
  permissions: 0,
  mentionable: false,
  position: -1,
  hoist: false,
  color: 0,
  managed: false
};

class Role extends BaseModel {
  constructor(def) {
    super(BaseRole, def);
  }
}

module.exports = Role;