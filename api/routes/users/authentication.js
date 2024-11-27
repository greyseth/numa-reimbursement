const express = require("express");
const router = express.Router();

const requireParams = require("../../middlewares/requireParams");
const connection = require("../../util/db");
const encrypt = require("../../util/encrypt");
const generateToken = require("../../util/generateToken");

router.post(
  "/register",
  requireParams(["username", "email", "password"]),
  (req, res) => {
    encrypt.encryptPassword(req.body.password, (err, hash) => {
      if (err) return res.status(500).json({ error: err });

      connection.query(
        `
        INSERT INTO users(username, email, password, phone)
        VALUES(?, ?, ?, ?);
      `,
        [req.body.username, req.body.email, hash, req.body.phone ?? ""],
        (err, rows, fields) => {
          if (err) return res.status(500).json({ error: err });
          res.sendStatus(200);
        }
      );
    });
  }
);

router.post("/login", requireParams(["email", "password"]), (req, res) => {
  connection.query(
    `
      SELECT id_user, username, email, phone, password FROM users
      WHERE email = ?
    `,
    [req.body.email],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length < 1) return res.status(200).json({ success: false });

      encrypt.comparePassword(
        req.body.password,
        rows[0].password,
        (err, isPasswordMatch) => {
          if (err) return res.status(500).json({ error: err });
          if (!isPasswordMatch) return res.status(200).json({ success: false });

          res.status(200).json({
            success: true,
            auth_token: generateToken(rows[0].id_user),
            username: rows[0].username,
            email: rows[0].email,
            phone: rows[0].phone,
          });
        }
      );
    }
  );
});

module.exports = router;
