const jwt = require("jsonwebtoken");

function generateToken(id_user) {
  return jwt.sign({ id_user: id_user }, process.env.TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

module.exports = generateToken;
