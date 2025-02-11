const express = require("express");
const requireRoles = require("../../middlewares/requireRoles");
const connection = require("../../util/db");
const requireParams = require("../../middlewares/requireParams");
const { upload, singleUpload } = require("../../util/upload");
const statusCheck = require("../../util/email/statusCheck");
const { sendEmail } = require("../../util/email/emailUtil");
const formatDate = require("../../util/dateFormatter");
const router = express.Router();

// Creates approval for individual request items
router.put("/item/:id_item", requireRoles(["verification"]), (req, res) => {
  // Optional parameters: approved (boolean), notes (string)

  singleUpload(req, res, (err) => {
    if (err) return res.status(500).json({ error: err });

    // Verifies that user didn't create the item themselves
    connection.query(
      `SELECT 
        items.id_request, items_approval.status 
      FROM items_approval 
      LEFT JOIN items ON items.id_item = items_approval.id_item
      LEFT JOIN requests ON requests.id_request = items.id_request
      WHERE items_approval.id_item = ? AND requests.id_user != ?`,
      [req.params.id_item, req.id_user],
      (err, rows, fields) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length < 1)
          return res.status(404).json({ error: "id_item not found" });

        const id_request = rows[0].id_request;

        const status = req.body.approved ? "approved" : "rejected";

        connection.query(
          `
            UPDATE items_approval 
            SET id_approver = ?, status = ?, notes = ?, approval_date = NOW(), file = ?
            WHERE id_item = ?;
          `,
          [
            req.id_user,
            status,
            req.body.notes ?? "",
            req.file ? req.file.filename : null,
            req.params.id_item,
          ],
          (err, rows, fields) => {
            if (err) return res.status(500).json({ error: err });
            res.sendStatus(200);
          }
        );
      }
    );
  });
});

router.put("/payment/:id_item", requireRoles(["approver"]), (req, res) => {
  singleUpload(req, res, (err) => {
    if (err) return res.status(500).json({ error: err });

    if (req.body.approved && req.body.approved !== "false" && !req.file)
      return res
        .status(400)
        .json({ error: "Missing file attachment to approve item" });

    connection.query(
      `
        UPDATE items_finance SET status = ?, id_finance = ?, notes = ?, approval_date = NOW(), file = ?
        WHERE id_item = ?
      `,
      [
        req.body.approved && req.body.approved !== "false"
          ? "paid"
          : "rejected",
        req.id_user,
        req.body.notes ?? "",
        req.file ? req.file.filename : "",
        req.params.id_item,
      ],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({
          status:
            req.body.approved && req.body.approved !== "false" ? true : false,
          notes: req.body.notes ?? "",
          date: new Date().toString(),
          image: req.file ? req.file.filename : "",
          user: {},
        });
      }
    );
  });
});

router.get("/notify/:id_request", requireRoles(["approver"]), (req, res) => {
  // Gets user data
  connection.query(
    `
      SELECT users.email
      FROM requests
      LEFT JOIN users ON users.id_user = requests.id_user
      WHERE requests.id_request = ?
    `,
    [req.params.id_request],
    (err, rows) => {
      if (err) return res.status(500).json({ err: err });
      if (rows.length < 1)
        return res.status(500).json({ err: "Requestor email not found" });

      const destinationAddress = rows[0].email;

      // Gets request data
      connection.query(
        `
          SELECT title, description, type, date_created, status
          FROM requests
          WHERE id_request = ?
        `,
        [req.params.id_request],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err });

          const requestDetails = rows[0];

          // Gets item data
          connection.query(
            `
              SELECT items.name,
                verif.status AS verif_status,
                finance.status AS finance_status
              FROM items
              LEFT JOIN items_approval verif ON verif.id_item = items.id_item
              LEFT JOIN items_finance finance ON finance.id_item = items.id_item
              WHERE items.id_request = ?
            `,
            [req.params.id_request],
            (err, rows) => {
              if (err) return res.status(500).json({ error: err });

              let items = rows;

              let itemsString = "";
              items.forEach((i) => {
                itemsString += `
                  <tr>
                    <td><p style="color: gray">${i.name}</p></td>
                    <td><p>Verfication approval: <span style="color: ${
                      i.verif_status === "pending"
                        ? "yellow"
                        : i.verif_status === "approved"
                        ? "blue"
                        : "red"
                    }">${i.verif_status.toUpperCase()}</span</p></td>
                    
                    <td><p>Approver payment: <span style="color: ${
                      i.finance_status === "approved"
                        ? "yellow"
                        : i.finance_status === "paid"
                        ? "green"
                        : "red"
                    }">${
                  i.finance_status !== "approved"
                    ? i.verif_status.toUpperCase()
                    : "PENDING"
                }</span</p></td>
                  </tr>
                `;
              });

              sendEmail(
                destinationAddress,
                {
                  ...requestDetails,
                  date_created: formatDate(requestDetails.date_created),
                  items: itemsString,
                  url:
                    process.env.FRONTEND_HOSTNAME +
                    "/reimbursement/view/" +
                    req.params.id_request,
                },
                (err, info) => {
                  if (err) return res.status(500).json({ error: err });
                  res.sendStatus(200);
                }
              );
            }
          );
        }
      );
    }
  );
});

// Creates finance payment approval for requests (unused)
// router.put("/payment/:id_request", requireRoles(["approver"]), (req, res) => {
//   // Optional params: {approved: boolean, notes: string}

//   singleUpload(req, res, (err) => {
//     if (err) return res.status(500).json({ error: err });

//     if (req.body.approved && req.body.approved !== "false" && !req.file)
//       return res.status(400).json({ error: "Approval must include image" });

//     // Verifies that request is approved before actually updating
//     connection.query(
//       `
//         SELECT requests_finance.status FROM requests_finance
//         LEFT JOIN requests ON requests.id_request = requests_finance.id_request
//         WHERE requests_finance.id_request = ? AND requests.id_user != ?
//       `,
//       [req.params.id_request, req.id_user],
//       (err, rows, fields) => {
//         if (err) return res.status(500).json({ error: err });
//         if (rows.length < 1)
//           return res.status(404).json({ error: `id_request not found` });

//         if (rows[0].status !== "pending")
//           return res
//             .status(401)
//             .json({ error: "Request already has approval" });

//         connection.query(
//           `
//           UPDATE
//           requests_finance SET status = ?, notes = ?, approval_date = NOW(), filename = ?, id_finance = ?
//           WHERE id_request = ?
//           `,
//           [
//             req.body.approved && req.body.approved !== "false"
//               ? "approved"
//               : "rejected",
//             req.body.notes ?? "",
//             req.file ? req.file.filename : "",
//             req.id_user,
//             req.params.id_request,
//           ],
//           (err, rows, fields) => {
//             if (err) return res.status(500).json({ error: err });
//             statusCheck(true, req.params.id_request);

//             res.status(200).json({
//               status:
//                 req.body.approved && req.body.approved !== "false"
//                   ? "approved"
//                   : "rejected",
//               notes: req.body.notes,
//               date: new Date().toString(),
//               image: req.file ? req.file.filename : "",
//               user: {},
//             });
//           }
//         );
//       }
//     );
//   });
// });

module.exports = router;
