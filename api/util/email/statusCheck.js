const formatDate = require("../dateFormatter");
const connection = require("../db");
const { sendEmail } = require("./emailUtil");

function statusCheck(finance, id_request) {
  if (finance) {
    // Always send email
    connection.query(
      `
        SELECT 
            r.title, r.description, r.type, r.date_created, r.status,
            users.email
        FROM requests r
        LEFT JOIN users ON users.id_user = r.id_user
        WHERE r.id_request = ?
        LIMIT 1;
    `,
      [id_request],
      (err, rows) => {
        if (err) {
          console.log("Failed to send email for " + id_request);
          console.log(err);
          return;
        }

        const data = rows[0];
        sendEmail(
          data.email,
          {
            title: data.title,
            description: data.description ?? "(No description provided)",
            type: data.type,
            date_created: formatDate(data.date_created),
            status: data.status,
            url:
              process.env.FRONTEND_HOSTNAME +
              "/reimbursement/view/" +
              id_request,
          },
          (err, info) => {
            if (err) {
              console.log("Failed to send email for " + id_request);
              console.log(err);
              return;
            }
          }
        );
      }
    );
  } else {
    // Only send if rejected or approved
    connection.query(
      `
            SELECT items_approval.status
            FROM items
            LEFT JOIN items_approval ON items_approval.id_item = items.id_item
            WHERE items.id_request = ?
        `,
      [id_request],
      (err, rows) => {
        if (err) {
          console.log("Failed to send email at " + id_request);
          console.log(err);
          return;
        }

        if (rows.length > 0) {
          let allApproved = true;
          let isRejected = false;
          rows.forEach((row) => {
            if (row === "pending") allApproved = false;
            if (row === "rejected") isRejected = true;
          });

          if (allApproved || isRejected) {
            connection.query(
              `
                        SELECT 
                            r.title, r.description, r.type, r.date_created, r.status,
                            users.email
                        FROM requests r
                        LEFT JOIN users ON users.id_user = r.id_user
                        WHERE r.id_request = ?
                        LIMIT 1;
                    `,
              [id_request],
              (err, rows) => {
                if (err) {
                  console.log("Failed to send email at " + id_request);
                  console.log(err);
                  return;
                }

                if (rows.length > 0) {
                  const data = rows[0];
                  sendEmail(
                    data.email,
                    {
                      title: data.title,
                      description:
                        data.description ?? "(No description provided)",
                      type: data.type,
                      date_created: formatDate(data.date_created),
                      status: data.status,
                      url:
                        process.env.FRONTEND_HOSTNAME +
                        "/reimbursement/view/" +
                        id_request,
                    },
                    (err, info) => {
                      if (err) {
                        console.log("Failed to send email for " + id_request);
                        console.log(err);
                        return;
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  }
}

module.exports = statusCheck;
