const express = require("express");
const requireRoles = require("../../middlewares/requireRoles");
const requireParams = require("../../middlewares/requireParams");
const connection = require("../../util/db");
const excel = require("excel4node");
const formatDate = require("../../util/dateFormatter");
const router = express.Router();

router.post(
  "/month",
  requireRoles(["finance", "approver"]),
  requireParams(["month", "year"]),
  (req, res) => {
    connection.query(
      `
        SELECT
          requests.id_request, requests.title, requests.description, requests.date_created, requests.type,
          owner.username As requestor_name,
          requests_finance.status AS finance_status, requests_finance.filename AS finance_image
        FROM requests
        LEFT JOIN users owner ON owner.id_user = requests.id_user
        LEFT JOIN requests_finance ON requests_finance.id_request = requests.id_request
        WHERE MONTH(requests.date_created) = ? AND YEAR(requests.date_created) = ?
      `,
      [req.body.month, req.body.year],
      (err, rows, fields) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length < 1) return res.status(404).json([]);

        let requests = rows;

        connection.query(
          `
            SELECT
              items.id_request, items.name, items.price, items.date_purchased, categories.category AS category,
              items_approval.status
            FROM items
            LEFT JOIN items_approval ON items_approval.id_item = items.id_item
            LEFT JOIN categories ON categories.id_category = items.id_category
            WHERE id_request IN (?)
          `,
          [requests.map((r) => r.id_request)],
          (err, rows, fields) => {
            if (err) return res.status(500).json({ error: err });

            requests = requests.map((r) => ({
              ...r,
              items: rows.filter((row) => row.id_request === r.id_request),
            }));

            createReport(
              requests.map((r) => ({
                ...r,
                date_created: formatDate(r.date_created),
                finance_image:
                  process.env.BACKEND_HOSTNAME + "/img/" + r.finance_image,
                items: r.items.map((ri) => ({
                  ...ri,
                  date_purchased: formatDate(ri.date_purchased),
                })),
              })),
              `REQUESTS ${req.body.month}/${req.body.year}`,
              res
            );
          }
        );
      }
    );
  }
);

router.post(
  "/date",
  requireRoles(["finance", "approver"]),
  requireParams(["from", "to"]),
  (req, res) => {
    connection.query(
      `
        SELECT
          requests.id_request, requests.title, requests.description, requests.date_created, requests.type,
          owner.username As requestor_name,
          requests_finance.status AS finance_status, requests_finance.filename AS finance_image
        FROM requests
        LEFT JOIN users owner ON owner.id_user = requests.id_user
        LEFT JOIN requests_finance ON requests_finance.id_request = requests.id_request
        WHERE date_created > ? AND date_created < ?
      `,
      [req.body.from, req.body.to],
      (err, rows, fields) => {
        if (err) return res.status(500).json({ error: err });
        if (rows.length < 1) return res.status(404).json([]);

        let requests = rows;

        connection.query(
          `
            SELECT
              items.id_request, items.name, items.price, items.date_purchased, categories.category AS category,
              items_approval.status
            FROM items
            LEFT JOIN items_approval ON items_approval.id_item = items.id_item
            LEFT JOIN categories ON categories.id_category = items.id_category
            WHERE id_request IN (?)
          `,
          [requests.map((r) => r.id_request)],
          (err, rows, fields) => {
            if (err) return res.status(500).json({ error: err });

            requests = requests.map((r) => ({
              ...r,
              items: rows.filter((row) => row.id_request === r.id_request),
            }));

            createReport(
              requests.map((r) => ({
                ...r,
                date_created: formatDate(r.date_created),
                finance_image:
                  process.env.BACKEND_HOSTNAME + "/img/" + r.finance_image,
                items: r.items.map((ri) => ({
                  ...ri,
                  date_purchased: formatDate(ri.date_purchased),
                })),
              })),
              `REQUESTS FROM ${req.body.from} TO ${req.body.to}`,
              res
            );
          }
        );
      }
    );
  }
);

router.post("/all", requireRoles(["finance", "approver"]), (req, res) => {
  connection.query(
    `
      SELECT
          requests.id_request, requests.title, requests.description, requests.date_created, requests.type,
          owner.username As requestor_name,
          requests_finance.status AS finance_status, requests_finance.filename AS finance_image
        FROM requests
        LEFT JOIN users owner ON owner.id_user = requests.id_user
        LEFT JOIN requests_finance ON requests_finance.id_request = requests.id_request
      WHERE YEAR(date_created) = ?
    `,
    [new Date().getFullYear()],
    (err, rows, fields) => {
      if (err) return res.status(500).json({ error: err });
      if (rows.length < 1) return res.status(404).json([]);

      let requests = rows;

      connection.query(
        `
            SELECT
              items.id_request, items.name, items.price, items.date_purchased, categories.category AS category,
              items_approval.status
            FROM items
            LEFT JOIN items_approval ON items_approval.id_item = items.id_item
            LEFT JOIN categories ON categories.id_category = items.id_category
            WHERE id_request IN (?)
          `,
        [requests.map((r) => r.id_request)],
        (err, rows, fields) => {
          if (err) return res.status(500).json({ error: err });

          requests = requests.map((r) => ({
            ...r,
            items: rows.filter((row) => row.id_request === r.id_request),
          }));

          createReport(
            requests.map((r) => ({
              ...r,
              date_created: formatDate(r.date_created),
              finance_image:
                process.env.BACKEND_HOSTNAME + "/img/" + r.finance_image,
              items: r.items.map((ri) => ({
                ...ri,
                date_purchased: formatDate(ri.date_purchased),
              })),
            })),
            new Date().getFullYear() + " REQUESTS",
            res
          );
        }
      );
    }
  );
});

function createReport(data, header, res) {
  try {
    const wb = new excel.Workbook();
    let ws = wb.addWorksheet("Report");

    // Define styles
    const fullBorder = {
      left: { style: "medium", color: "black" },
      right: { style: "medium", color: "black" },
      bottom: { style: "medium", color: "black" },
      top: { style: "medium", color: "black" },
    };
    const yellowFill = {
      type: "pattern",
      fgColor: "#FFFF00",
      patternType: "solid",
    };
    const redFill = {
      type: "pattern",
      fgColor: "#FF0000",
      patternType: "solid",
    };
    const blueFill = {
      type: "pattern",
      fgColor: "#0000FF",
      patternType: "solid",
    };
    const greenFill = {
      type: "pattern",
      fgColor: "#00FF00",
      patternType: "solid",
    };
    const headerStyle = wb.createStyle({
      font: { bold: true },
      fill: {
        type: "pattern",
        fgColor: "#FFFF00",
        patternType: "solid",
      },
      alignment: { horizontal: "center" },
      border: fullBorder,
    });

    const columns = [
      {
        label: "ID",
        width: 80,
        centered: true,
        value: "id_request",
        number: true,
      },
      {
        label: "Request Title",
        width: 239,
        value: "title",
      },
      {
        label: "Request Description",
        width: 240,
        value: "description",
      },
      {
        label: "Request Type",
        width: 240,
        value: "type",
      },
      {
        label: "Requestor Name",
        width: 160,
        value: "requestor_name",
      },
      {
        label: "Created At",
        width: 160,
        value: "date_created",
      },
      {
        label: "Items Name",
        width: 420,
        value: "item_name",
      },
      {
        label: "Items Category",
        width: 420,
        value: "item_category",
      },
      {
        label: "Items Price",
        width: 160,
        value: "item_price",
        centered: true,
      },
      {
        label: "Items Date Purchased",
        width: 200,
        value: "item_date_purchased",
      },
      {
        label: "Items Status",
        width: 120,
        value: "item_status",
        centered: true,
      },
      {
        label: "Finance Approval",
        width: 165,
        value: "finance_status",
        centered: true,
      },
      {
        label: "Payment Image URL",
        width: 250,
        value: "finance_image",
        centered: true,
      },
    ];

    // Worksheet title
    ws.cell(2, 2, 3, 2 + columns.length - 1, true)
      .string(header)
      .style({
        border: fullBorder,
        alignment: { horizontal: "center", vertical: "center" },
        font: { bold: true },
      });

    // Column headers
    columns.forEach((col, i) => {
      ws.column(2 + i).setWidth(col.width / 10);
      ws.cell(5, 2 + i)
        .string(col.label)
        .style(headerStyle);
    });

    let lastRow = 6;
    data.forEach((req) => {
      columns.forEach((col, i) => {
        if (!col.value.startsWith("item_")) {
          const cell = ws.cell(lastRow, 2 + i);

          if (!col.value.endsWith("_status")) {
            if (typeof req[col.value] === "number") cell.number(req[col.value]);
            else cell.string(req[col.value]);
          } else {
            const status = req[col.value];
            cell.string(status.toUpperCase());

            cell.style({ font: { bold: true } });

            switch (status) {
              case "pending":
                cell.style({ fill: yellowFill });
                break;
              case "approved":
                cell.style({ fill: blueFill });
                break;
              case "paid":
                cell.style({ fill: greenFill });
                break;
              case "rejected":
                cell.style({ fill: redFill });
                break;
            }
          }

          cell.style({ border: fullBorder });

          if (col.centered)
            cell.style({
              alignment: { horizontal: "center", vertical: "center" },
            });
        }
      });

      req.items.forEach((i, ii) => {
        const itemColumns = columns
          .map((c, i) => {
            if (c.value.startsWith("item_"))
              return { ...c, value: c.value.split("item_")[1], index: i };
            else return null;
          })
          .filter((c) => c);

        itemColumns.forEach((col) => {
          const cell = ws.cell(lastRow, 2 + col.index);

          if (!col.value.endsWith("status")) {
            if (typeof i[col.value] === "number") cell.number(i[col.value]);
            else cell.string(i[col.value]);
          } else {
            const status = i[col.value];
            cell.string(status.toUpperCase());

            cell.style({ font: { bold: true } });

            switch (status) {
              case "pending":
                cell.style({ fill: yellowFill });
                break;
              case "approved":
                cell.style({ fill: blueFill, font: { color: "white" } });
                break;
              case "paid":
                cell.style({ fill: greenFill });
                break;
              case "rejected":
                cell.style({ fill: redFill });
                break;
            }
          }

          cell.style({ border: fullBorder });

          if (col.centered)
            cell.style({
              border: fullBorder,
              alignment: { horizontal: "center", vertical: "center" },
            });
        });

        lastRow++;
      });
    });

    wb.write("Export.xlsx", res);
  } catch (err) {
    console.log("export error");
    res.status(500).json({ error: err });
  }
}

module.exports = router;
