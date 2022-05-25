const RevsilHandler = require("./lib");

function Revsil(token, options) {
    return new RevsilHandler.RevsilHandler(token, options);
}
Revsil.VERSION = require('../package.json').version;

module.exports = Revsil;
