const connection = require("../util/db");

const verifyRole = (req, res, next) => {
  if (req.path.includes("/login")) return next();

  if (!req.id_user || !req.id_role)
    return res.status(401).json({ error: "Failed to authenticate access" });

  connection.query(
    `
      SELECT id_user, id_role FROM users WHERE id_user = ? AND id_role = ? AND active = TRUE;
    `,
    [req.id_user, req.id_role],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length < 1)
        return res.status(401).json({ error: "Failed to verify role" });

      next();
    }
  );
};

module.exports = verifyRole;
