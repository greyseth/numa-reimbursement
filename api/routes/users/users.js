const express = require("express");
const router = express.Router();

const authentication = require("./authentication");
const connection = require("../../util/db");
router.use("/auth", authentication);

router.get("/self", (req, res) => {
  connection.query(
    `
        SELECT 
        users.username, users.email, users.phone, 
        users.id_role, roles.role_name AS role 
        FROM users
        LEFT JOIN roles ON roles.id_role = users.id_role
        WHERE id_user = ?
    `,
    [req.id_user],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length < 1) return res.sendStatus(404);
      res.status(200).json(rows[0]);
    }
  );
});

module.exports = router;
