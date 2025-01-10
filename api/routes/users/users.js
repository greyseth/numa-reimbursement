const express = require("express");
const router = express.Router();

const authentication = require("./authentication");
const connection = require("../../util/db");
const requireRoles = require("../../middlewares/requireRoles");
const requireParams = require("../../middlewares/requireParams");
const { encryptPassword } = require("../../util/encrypt");
router.use("/auth", authentication);

router.get("/self", (req, res) => {
  connection.query(
    `
      SELECT 
      users.*, roles.role_name AS role 
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

router.get("/all", requireRoles(["admin"]), (req, res) => {
  connection.query(
    `
      SELECT users.id_user, users.username, users.email, users.nik, roles.role_name AS role
      FROM users
      LEFT JOIN roles ON roles.id_role = users.id_role;
    `,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json(rows);
    }
  );
});

router.get("/roles", requireRoles(["admin"]), (req, res) => {
  connection.query(`SELECT * FROM roles;`, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(rows);
  });
});

router.get("/:id_user", requireRoles(["admin"]), (req, res) => {
  connection.query(
    `SELECT username, email, nik, id_role FROM users WHERE id_user = ? LIMIT 1;`,
    [req.params.id_user],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length < 1) return res.sendStatus(404);

      res.status(200).json(rows[0]);
    }
  );
});

router.put(
  "/:id_user",
  requireParams(["username", "email", "id_role", "nik"]),
  requireRoles(["admin"]),
  (req, res) => {
    if (req.body.password) {
      encryptPassword(req.body.password, (err, hash) => {
        if (err) return res.status(500).json({ error: err });
        connection.query(
          `
            UPDATE users 
            SET username = ?, email = ?, id_role = ?, nik = ?, password = ? 
            WHERE id_user = ?
          `,
          [
            req.body.username,
            req.body.email,
            req.body.id_role,
            req.body.nik,
            hash,
            req.params.id_user,
          ],
          (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.sendStatus(200);
          }
        );
      });
    } else {
      connection.query(
        `
          UPDATE users 
          SET username = ?, email = ?, id_role = ?, nik = ? 
          WHERE id_user = ?
        `,
        [
          req.body.username,
          req.body.email,
          req.body.id_role,
          req.body.nik,
          req.params.id_user,
        ],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err });
          res.sendStatus(200);
        }
      );
    }
  }
);

router.delete("/:id_user", requireRoles(["admin"]), (req, res) =>
  connection.query(
    `DELETE FROM users WHERE id_user = ?`,
    [req.params.id_user],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.sendStatus(200);
    }
  )
);

module.exports = router;
