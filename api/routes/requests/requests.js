const express = require("express");
const connection = require("../../util/db");
const requireRoles = require("../../middlewares/requireRoles");
const requireParams = require("../../middlewares/requireParams");
const { arrayUpload } = require("../../util/upload");
const requireParamsAfter = require("../../middlewares/requireParamsAfter");

const router = express.Router();

const collapsedQuery = `
  SELECT requests.*, users.username, SUM(items.price) AS total_price
  FROM requests
  LEFT JOIN users ON users.id_user = requests.id_user
  LEFT JOIN items ON items.id_request = requests.id_request
  `;

router.post("/search/:page_num", (req, res) => {
  let optionalChecks = [];

  if (req.id_role === 1)
    // USER role
    optionalChecks.push({
      clause: "AND requests.id_user = ?",
      value: req.id_user,
    });
  else if (req.id_role === 2)
    // APPROVER role
    optionalChecks.push({
      clause: "AND requests.status = 'pending' OR requests.status = 'rejected'",
      value: null,
    });
  else if (req.id_role === 3)
    // FINANCE role
    optionalChecks.push({
      clause: "AND requests.status = 'approved' OR requests.status = 'paid'",
      value: null,
    });

  if (req.body.search)
    optionalChecks.push({
      clause: `AND MATCH(title, description) AGAINST (? IN NATURAL LANGUAGE MODE)`,
      value: req.body.search,
    });

  if (req.body.days)
    optionalChecks.push({
      clause: `AND date_created > DATE_SUB(NOW(), INTERVAL ? DAY)`,
      value: req.body.days,
    });

  let checkString = "";
  optionalChecks.forEach((oc) => {
    checkString += oc.clause;
    checkString += "\n";
  });

  connection.query(
    `
      ${collapsedQuery}
      WHERE 1=1
      ${checkString}
      GROUP BY requests.id_request
      ORDER BY requests.date_created ${
        req.body.orderBy === "ASC" ? "ASC" : "DESC"
      }
      LIMIT 20
      OFFSET ?
    `,
    [
      ...optionalChecks.map((oc) => oc.value).filter((oc) => oc),
      (req.params.page_num - 1) * 20,
    ],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      res.status(200).json(rows);
    }
  );
});

router.post("/", requireRoles(["user"]), (req, res) => {
  arrayUpload(req, res, (err) => {
    if (err) return res.status(500).json({ error: err });

    requireParamsAfter(req, res, ["items", "items"], () => {
      connection.beginTransaction((err) => {
        if (err)
          return connection.rollback(() =>
            res.status(500).json({ error: err })
          );

        // Inserts request data
        connection.query(
          `
            INSERT INTO requests
              (title, description, date_created, id_user)
            VALUES (?, ?, NOW(), ?);
          `,
          [req.body.title, req.body.description ?? "", req.id_user],
          (err, rows, fields) => {
            if (err)
              return connection.rollback(() =>
                res.status(500).json({ error: err })
              );

            const id_request = rows.insertId;

            // Inserts every request item
            const items = JSON.parse(req.body.items);
            if (items.length < 1)
              return connection.rollback(() =>
                res.status(500).json({ error: err })
              );
            let itemsInsert = items.map((i, index) => [
              id_request,
              i.name,
              i.price,
              i.date,
              req.files[index].filename,
            ]);
            connection.query(
              `
                INSERT INTO items(id_request, name, price, date_purchased, filename)
                VALUES ?
              `,
              [itemsInsert],
              (err, rows, fields) => {
                if (err)
                  return connection.rollback(() =>
                    res.status(500).json({ error: err })
                  );

                connection.commit((err) => {
                  if (err) return res.status(500).json({ error: err });
                  res.status(200).json({ id_request: id_request });
                });
              }
            );
          }
        );
      });
    });
  });
});

router.get("/:id_request", (req, res) => {
  // TODO-done: Update endpoint to also incude approval (once item approvals are done)
  connection.query(
    `
        SELECT requests.*, SUM(items.price) AS total_price, 
          users.id_user AS requestor_id, users.username AS requestor_name, 
          users.email AS requestor_email, users.phone AS requestor_phone,
          finance_app.status AS finance_status, finance_app.notes AS finance_notes, finance_app.approval_date AS finance_date, finance_app.filename AS finance_image,
          finance.username AS finance_name, finance.email AS finance_email
        FROM requests
        LEFT JOIN users ON users.id_user = requests.id_user
        LEFT JOIN items ON items.id_request = requests.id_request
        LEFT JOIN requests_finance finance_app ON finance_app.id_request = requests.id_request
        LEFT JOIN users finance ON finance.id_user = finance_app.id_finance
        WHERE requests.id_request = ?
        GROUP BY requests.id_request
        LIMIT 1;
      `,
    [req.params.id_request],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length < 1)
        return res.status(404).json({ error: "id_request not found" });

      let requestDetails = {};
      Object.keys(rows[0]).forEach((k) => {
        if (!k.startsWith("requestor_")) requestDetails[k] = rows[0][k];
      });

      let userDetails = {
        id_user: rows[0].requestor_id,
        username: rows[0].requestor_name,
        email: rows[0].requestor_email,
        phone: rows[0].requestor_phone,
      };

      let financeApproval = {
        status: rows[0].finance_status,
      };

      if (financeApproval.status !== "pending") {
        financeApproval.notes = rows[0].finance_notes;
        financeApproval.date = rows[0].finance_date;
        financeApproval.image = rows[0].finance_image;
        financeApproval.user = {
          username: rows[0].finance_name,
          email: rows[0].finance_email,
        };
      }

      connection.query(
        `
          SELECT 
            items.*, 
            app.status AS approval_status, app.notes AS approval_notes, app.approval_date,
            users.username AS approval_username
          FROM items 
          LEFT JOIN items_approval app ON app.id_item = items.id_item
          LEFT JOIN users ON users.id_user = app.id_approver
          WHERE items.id_request = ?
          GROUP BY items.id_item;
        `,
        [req.params.id_request],
        (err, rows, fields) => {
          if (err) return res.status(500).json({ error: err });

          res.status(200).json({
            request: requestDetails,
            user: userDetails,
            finance: financeApproval,
            items: rows.map((r) => {
              let rCopy = {
                ...r,
                date: r.date_purchased,
                image: r.filename,
              };

              delete rCopy.date_purchased;
              delete rCopy.filename;

              let approval = {};
              if (rCopy.approval_status !== "pending") {
                approval.status = rCopy.approval_status;
                approval.notes = rCopy.approval_notes;
                approval.date = rCopy.approval_date;
                approval.approver = rCopy.approval_username;
              }

              delete rCopy.approval_status;
              delete rCopy.approval_notes;
              delete rCopy.approval_date;
              delete rCopy.approval_username;

              return { ...rCopy, approval: approval };
            }),
          });
        }
      );
    }
  );
});

module.exports = router;
