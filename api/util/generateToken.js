const jwt = require("jsonwebtoken");

function generateToken(id_user, id_role) {
  return jwt.sign(
    { id_user: id_user, id_role: id_role },
    process.env.TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

module.exports = generateToken;
