"use strict";
const BaseModel = require("./BaseModel");

const BaseMember = {
  _id: null,
  nickname: null,
  avatar: null,
  roles: null,
};

class Member extends BaseModel {
  constructor(def) {
    super(BaseMember, def);
  }
}

module.exports = Member;