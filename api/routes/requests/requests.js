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
  let whereClause = "WHERE 1=1";

  if (req.id_role === 1)
    whereClause = `WHERE requests.id_user = ?`; // USER role
  else if (req.id_role === 2)
    whereClause = `WHERE requests.status = 'pending'`; // APPROVER role
  else if (req.id_role === 3)
    whereClause = `WHERE requests.status = 'approved'`; // FINANCE role

  connection.query(
    `
            ${collapsedQuery}
            ${whereClause}
            ${
              req.body.search
                ? `AND MATCH(title, description) AGAINST (? IN NATURAL LANGUAGE MODE)`
                : ""
            }
            ${
              req.body.days
                ? `AND date_created > DATE_SUB(NOW(), INTERVAL ${req.body.days} DAY)`
                : ""
            }
            GROUP BY requests.id_request
            ORDER BY requests.date_created ${req.body.orderBy ?? "DESC"}
            LIMIT ${(req.params.page_num + 1) * 20};

        `,
    [
      req.id_user,
      req.body.search ? req.body.search : null,
      req.body.search ? req.body.search : null,
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

// router.get('/id_request', (req, res) => {
//     connection.query(
//       `
//         SELECT requests.*, SUM(items.price)
//         FROM requests
//         LEFT JOIN items ON items.id_requests = items.id_request
//         WHERE
//         GROUP BY
//       `,
//       [], (err, rows, fields) => {
//         if (err) return res.status(500).json({error: err});

//       }
//     )
// })

module.exports = router;
