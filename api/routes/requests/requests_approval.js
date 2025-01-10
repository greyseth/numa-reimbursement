const express = require("express");
const requireRoles = require("../../middlewares/requireRoles");
const connection = require("../../util/db");
const requireParams = require("../../middlewares/requireParams");
const { upload, singleUpload } = require("../../util/upload");
const router = express.Router();

// Creates approval for individual request items
router.put("/item/:id_item", requireRoles(["approver"]), (req, res) => {
  // Optional parameters: approved (boolean), notes (string)

  // Verifies that item is still pending
  connection.query(
    `SELECT status FROM items_approval WHERE id_item = ?`,
    [req.params.id_item],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length < 1)
        return res.status(404).json({ error: "id_item not found" });

      if (rows[0].status === "pending") {
        connection.query(
          `
          UPDATE items_approval 
          SET id_approver = ?, status = ?, notes = ?, approval_date = NOW() 
          WHERE id_item = ?;
        `,
          [
            req.id_user,
            req.body.approved ? "approved" : "rejected",
            req.body.notes ?? "",
            req.params.id_item,
          ],
          (err, rows, fields) => {
            if (err) return res.status(500).json({ error: err });
            res.sendStatus(200);
          }
        );
      } else res.status(401).json({ error: "Item already has been approved" });
    }
  );
});

// Creates finance payment approval for requests
router.put("/payment/:id_request", requireRoles(["finance"]), (req, res) => {
  // Optional params: {approved: boolean, notes: string}

  singleUpload(req, res, (err) => {
    if (err) return res.status(500).json({ error: err });

    // Verifies that request is approved before actually updating
    connection.query(
      `SELECT status FROM requests_finance WHERE id_request = ?`,
      [req.params.id_request],
      (err, rows, fields) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length < 1)
          return res.status(404).json({ error: `id_request not found` });

        if (rows[0].status !== "pending")
          return res
            .status(401)
            .json({ error: "Request already has approval" });

        connection.query(
          `
          UPDATE 
          requests_finance SET status = ?, notes = ?, approval_date = NOW(), filename = ?, id_finance = ?
          WHERE id_request = ?
          `,
          [
            req.body.approved ? "approved" : "rejected",
            req.body.notes ?? "",
            req.file.filename,
            req.id_user,
            req.params.id_request,
          ],
          (err, rows, fields) => {
            if (err) return res.status(500).json({ error: err });
            res
              .status(200)
              .json({
                status: req.body.approved ? "approved" : "rejected",
                notes: req.body.notes,
                date: new Date().toString(),
                image: req.file.filename,
                user: {},
              });
          }
        );
      }
    );
  });
});

module.exports = router;
