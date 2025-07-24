const crypto = require("crypto");

function generateVoterToken() {
  return crypto.randomBytes(16).toString("hex"); // 32-character random token
}

module.exports = { generateVoterToken };