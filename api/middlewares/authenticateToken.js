const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  if (req.path.includes("/login") || req.path.includes("/register"))
    return next();

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);

  if (!token)
    return res.status(401).json({ error: "Invalid authorization token" });

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: err });

    res.locals.id_user = user.id_user;
    next();
  });
};

module.exports = authenticateToken;
