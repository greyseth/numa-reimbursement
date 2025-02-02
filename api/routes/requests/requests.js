const util = require("node:util");
const express = require("express");
const connection = require("../../util/db");
const requireRoles = require("../../middlewares/requireRoles");
const requireParams = require("../../middlewares/requireParams");
const { arrayUpload } = require("../../util/upload");
const requireParamsAfter = require("../../middlewares/requireParamsAfter");

const router = express.Router();

const exportRoute = require("./requests_export");
const sendUpdateEmail = require("../../util/email/updateEmail");
router.use("/export", exportRoute);

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
  else if (req.id_role === 2) {
    // APPROVER role
    optionalChecks.push({
      clause:
        "AND (requests.status = 'pending' OR requests.status = 'rejected' OR requests.status = 'approved')",
      value: null,
    });

    optionalChecks.push({
      clause:
        req.body.owner === "toapprove"
          ? `AND requests.id_user != ?`
          : `AND requests.id_user = ?`,
      value: req.id_user,
    });
  } else if (req.id_role === 3) {
    // FINANCE role
    optionalChecks.push({
      clause: "AND (requests.status = 'approved' OR requests.status = 'paid')",
      value: null,
    });

    optionalChecks.push({
      clause:
        req.body.owner === "toapprove"
          ? `AND requests.id_user != ?`
          : `AND requests.id_user = ?`,
      value: req.id_user,
    });
  }

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

  if (req.body.type)
    optionalChecks.push({
      clause: `AND type = ?`,
      value: req.body.type,
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

router.post("/", (req, res) => {
  arrayUpload(req, res, (err) => {
    if (err) return res.status(500).json({ error: err });

    // idk if the double "items" was a mistake, but i dont really care atp it just fucking works man
    requireParamsAfter(req, res, ["title", "type", "items", "items"], () => {
      connection.beginTransaction((err) => {
        if (err)
          return connection.rollback(() =>
            res.status(500).json({ error: err })
          );

        // Inserts request data
        connection.query(
          `
            INSERT INTO requests
              (title, description, type, date_created, id_user, bank_number, bank_name)
            VALUES (?, ?, ?, NOW(), ?, ?, ?);
          `,
          [
            req.body.title,
            req.body.description ?? "",
            req.body.type,
            req.id_user,
            req.body.bankNumber,
            req.body.bankName,
          ],
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
              i.id_category,
              req.files[index].filename,
            ]);
            connection.query(
              `
                INSERT INTO items(id_request, name, price, date_purchased, id_category, filename)
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

router.get("/yearly", requireRoles(["approver", "admin"]), (req, res) => {
  connection.query(
    `
      SELECT 
        categories.category, SUM(items.price) AS amount
      FROM categories 
      LEFT JOIN items ON items.id_category = categories.id_category 
      LEFT JOIN requests ON requests.id_request = items.id_request
      WHERE YEAR(requests.date_created) = ? AND requests.type = 'reimburse'
      GROUP BY categories.id_category;
    `,
    [new Date().getFullYear()],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      const transfer = rows;

      connection.query(
        `
          SELECT 
            categories.category, SUM(items.price) AS amount 
          FROM categories 
          LEFT JOIN items ON items.id_category = categories.id_category 
          LEFT JOIN requests ON requests.id_request = items.id_request
          WHERE YEAR(requests.date_created) = ? AND requests.type = 'petty cash'
          GROUP BY categories.id_category;
        `,
        [new Date().getFullYear()],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err });
          const pettyCash = rows;

          res.status(200).json({
            transfer: transfer,
            petty: pettyCash,
          });
        }
      );
    }
  );
});

router.get(
  "/yearly/:month",
  requireRoles(["approver", "admin"]),
  (req, res) => {
    connection.query(
      `
      SELECT 
        categories.category, SUM(items.price) AS amount
      FROM categories 
      LEFT JOIN items ON items.id_category = categories.id_category 
      LEFT JOIN requests ON requests.id_request = items.id_request
      WHERE YEAR(requests.date_created) = ? AND MONTH(requests.date_created) = ? AND requests.type = 'reimburse'
      GROUP BY categories.id_category;
    `,
      [new Date().getFullYear(), req.params.month],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        const transfer = rows;

        connection.query(
          `
          SELECT 
            categories.category, SUM(items.price) AS amount 
          FROM categories 
          LEFT JOIN items ON items.id_category = categories.id_category 
          LEFT JOIN requests ON requests.id_request = items.id_request
          WHERE YEAR(requests.date_created) = ? AND MONTH(requests.date_created) = ? AND requests.type = 'petty cash'
          GROUP BY categories.id_category;
        `,
          [new Date().getFullYear(), req.params.month],
          (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            const pettyCash = rows;

            res.status(200).json({
              transfer: transfer,
              petty: pettyCash,
            });
          }
        );
      }
    );
  }
);

router.get("/:id_request", (req, res) => {
  connection.query(
    `
      SELECT 
        requests.*, SUM(items.price) AS total_price, 
        users.id_user AS requestor_id, users.username AS requestor_name, 
        users.email AS requestor_email, users.nik AS requestor_nik, users.active AS requestor_active,
        roles.role_name,
        finance_app.status AS finance_status, finance_app.notes AS finance_notes, finance_app.approval_date AS finance_date, finance_app.filename AS finance_image,
        finance.username AS finance_name, finance.email AS finance_email
      FROM requests
      LEFT JOIN users ON users.id_user = requests.id_user
      LEFT JOIN roles ON roles.id_role = users.id_role
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
        if (!k.startsWith("requestor_") && !k.startsWith("finance_"))
          requestDetails[k] = rows[0][k];
      });

      let userDetails = {
        id_user: rows[0].requestor_id,
        username: rows[0].requestor_name,
        email: rows[0].requestor_email,
        nik: rows[0].requestor_nik,
        active: rows[0].requestor_active,
        role: rows[0].role_name,
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
            categories.*,
            app.status AS approval_status, app.notes AS approval_notes, app.approval_date, app.file,
            users.username AS approval_username
          FROM items 
          LEFT JOIN items_approval app ON app.id_item = items.id_item
          LEFT JOIN users ON users.id_user = app.id_approver
          LEFT JOIN categories ON categories.id_category = items.id_category
          WHERE items.id_request = ? GROUP BY items.id_item;
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
                category: {
                  id_category: r.id_category,
                  category: r.category,
                },
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
                approval.file = rCopy.file;
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

router.put(
  "/:id_request/details",
  requireParams(["title", "bank_name", "bank_number", "type"]),
  async (req, res) => {
    // Params: {title: '', description: ''}

    let authorized = false;

    if (req.id_role === 4) authorized = true;
    else {
      // Checks if the user created the request
      const query = util.promisify(connection.query).bind(connection);
      const checkResult = await query(
        "SELECT id_user FROM requests WHERE id_request = " +
          req.params.id_request
      );

      if (checkResult.length < 1)
        return res.status(404).json({ error: "id_request not found" });
      if (req.id_user === checkResult[0].id_user) authorized = true;
    }

    if (!authorized)
      return res.status(401).json({ error: "Unauthorized access" });

    connection.query(
      `UPDATE requests SET title = ?, description = ?, bank_name = ?, bank_number = ?, type = ?, date_updated = NOW() WHERE id_request = ?`,
      [
        req.body.title,
        req.body.description ?? "",
        req.body.bank_name,
        req.body.bank_number,
        req.body.type,
        req.params.id_request,
      ],
      (err, rows, fields) => {
        if (err) return res.status(500).json({ error: err });
        res.sendStatus(200);
      }
    );
  }
);

router.put("/:id_request/items", async (req, res) => {
  // Parameters: {toDelete: JSONarray, toAdd: JSONarray, images: files}

  let authorized = false;

  if (req.id_role === 4) authorized = true;
  else {
    // Checks if user created the request
    const query = util.promisify(connection.query).bind(connection);
    const checkResult = await query(
      "SELECT id_user FROM requests WHERE id_request = " + req.params.id_request
    );

    if (checkResult.length < 1)
      return res.status(404).json({ error: "id_request not found" });
    if (req.id_user === checkResult[0].id_user) authorized = true;
  }

  if (!authorized)
    return res.status(401).json({ error: "Unauthorized access" });

  arrayUpload(req, res, (err) => {
    if (err) return res.status(500).json({ error: err });

    sendUpdateEmail(req.params.id_request, () => {
      connection.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: err });

        // Deletes items
        const deleteItems = JSON.parse(req.body.toDelete);
        connection.query(
          deleteItems.length > 0
            ? `DELETE FROM items WHERE id_item IN (?)`
            : "SELECT NULL",
          [deleteItems],
          (err, rows, fields) => {
            if (err)
              return connection.rollback(() =>
                res.status(500).json({ error: err })
              );

            //Inserts new items
            const items = JSON.parse(req.body.toAdd).map((i, ii) => [
              req.params.id_request,
              i.name,
              i.price,
              i.date,
              req.files[ii].filename,
            ]);
            connection.query(
              items.length > 0
                ? `INSERT INTO items(id_request, name, price, date_purchased, filename) VALUES ?`
                : "SELECT NULL",
              [items],
              (err, rows, fields) => {
                if (err)
                  return connection.rollback(() =>
                    res.status(500).json({ error: err })
                  );

                connection.query(
                  `
                    SELECT items_approval.status 
                    FROM items 
                    LEFT JOIN items_approval ON items_approval.id_item = items.id_item 
                    WHERE items.id_request = ?
                  `,
                  [req.params.id_request],
                  (err, rows) => {
                    if (err)
                      return connection.rollback(() =>
                        res.status(500).json({ error: err })
                      );
                    if (rows.length < 1)
                      return connection.rollback(() =>
                        res
                          .status(500)
                          .json({ error: "Items list cannot be empty" })
                      );

                    let setStatus = "approved";
                    let isRejected = false;
                    rows.forEach((r) => {
                      if (r.status === "pending") setStatus = "pending";
                      else if (r.status === "rejected") isRejected = true;
                    });

                    connection.query(
                      `UPDATE requests SET status = ? WHERE id_request = ?`,
                      [
                        isRejected ? "rejected" : setStatus,
                        req.params.id_request,
                      ],
                      (err, rows) => {
                        if (err)
                          return connection.rollback(() =>
                            res.status(500).json({ error: err })
                          );

                        connection.query(
                          `UPDATE requests_finance SET status = 'pending', notes = NULL, approval_date = NULL, filename = NULL, id_finance = NULL WHERE id_request = ?`,
                          [req.params.id_request],
                          (err, rows) => {
                            if (err)
                              return connection.rollback(() =>
                                res.status(500).json({ error: err })
                              );
                            connection.commit((err) => {
                              if (err)
                                return res.status(500).json({ error: err });

                              res.sendStatus(200);
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  });
});

router.delete("/:id_request", async (req, res) => {
  let authorized = false;

  if (req.id_role === 4) authorized = true;
  else {
    // Checks if the user created the request
    const query = util.promisify(connection.query).bind(connection);
    const checkResult = await query(
      "SELECT id_user FROM requests WHERE id_request = " + req.params.id_request
    );

    if (checkResult.length < 1)
      return res.status(404).json({ error: "id_request not found" });
    if (req.id_user === checkResult[0].id_user) authorized = true;
  }

  if (!authorized)
    return res.status(401).json({ error: "Unauthorized access" });

  connection.query(
    `DELETE FROM requests WHERE id_request = ?`,
    [req.params.id_request],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      res.sendStatus(200);
    }
  );
});

module.exports = router;
