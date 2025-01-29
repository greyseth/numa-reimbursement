const express = require("express");
const connection = require("../util/db");
const router = express.Router();

router.get("/categories", (req, res) => {
  connection.query(`SELECT * FROM categories;`, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json(rows);
  });
});

module.exports = router;
