const connection = require("../util/db");

function requireRoles(roles) {
  return (req, res, next) => {
    connection.query(
      `SELECT role_name FROM roles WHERE id_role = ?`,
      [req.id_role],
      (err, rows, fields) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length < 1)
          return res.status(401).json({ error: "id_role not found" });

        if (roles.includes(rows[0].role_name)) next();
        else res.status(401).json({ error: "Unauthorized access" });
      }
    );
  };
}

module.exports = requireRoles;
