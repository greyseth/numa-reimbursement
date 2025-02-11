const connection = require("../db");
const { sendEmail } = require("./emailUtil");

function sendUpdateEmail(id_request, cb) {
  connection.query(
    `
            SELECT 
                r.title, r.description, r.type, r.date_created, r.status,
                users.username, users.email, users.nik, 
            FROM requests r
            LEFT JOIN users ON users.id_user = r.id_user
            WHERE r.id_request = ?
            LIMIT 1;
        `,
    (err, rows) => {
      if (err) {
        console.log("Failed to send email for " + id_request);
        console.log(err);
        cb();
        return;
      }
      if (rows.length < 1) {
        console.log("Failed to send email for " + id_request);
        cb();
        return;
      }

      const data = rows[0];

      connection.query(
        `
          SELECT 
              users.email 
          FROM items_approval 
          LEFT JOIN items ON items.id_item = items_approval.id_item 
          LEFT JOIN requests ON requests.id_request = items.id_request 
          LEFT JOIN users ON users.id_user = items_approval.id_approver 
          WHERE requests.id_request = ?
          GROUP BY users.email 

          UNION 
          
          SELECT 
              users.email 
          FROM requests_finance 
          LEFT JOIN users ON users.id_user = requests_finance.id_finance 
          WHERE requests_finance.id_request = ?
              AND requests_finance.id_finance IS NOT NULL;
        `,
        [id_request],
        (err, rows) => {
          if (err) {
            console.log("Failed to send email for " + id_request);
            console.log(err);
            cb();
            return;
          }
          if (rows.length < 1) {
            cb();
            return console.log(
              "Could not find emails of approvers " + id_request
            );
          }
        }
      );
    }
  );
}

module.exports = sendUpdateEmail;
