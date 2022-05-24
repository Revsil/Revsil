"use strict";

const Constants = require("../Constants");
const MessageTypes = Constants.MessageTypes;
const BaseModel = require("./BaseModel");

const BaseMessage = {
  type: null,
  _id: null,
  nonce: null,
  channel: null,
  author: null,
  content: null,
  system: null,
};

class Message extends BaseModel {
  constructor(def) {
    super(BaseMessage, def);
  }
}

module.exports = Message;
