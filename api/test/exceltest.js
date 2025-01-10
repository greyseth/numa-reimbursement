const excel = require("excel4node");

const data = [
  {
    id_request: 1,
    title: "This is request #1",
    description: "This is the first request",
    requestor_name: "Grey",
    date_created: "2024-12-23",
    finance_status: "pending",
    items: [
      {
        name: "Item 1",
        price: 10000,
        date_purchased: "2024-12-22",
        status: "pending",
      },
      {
        name: "Item 2",
        price: 20000,
        date_purchased: "2024-12-23",
        status: "approved",
      },
    ],
  },
  {
    id_request: 1,
    title: "This is request #1",
    description: "This is the first request",
    requestor_name: "Grey",
    date_created: "2024-12-23",
    finance_status: "pending",
    items: [
      {
        name: "Item 1",
        price: 10000,
        date_purchased: "2024-12-22",
        status: "pending",
      },
      {
        name: "Item 2",
        price: 20000,
        date_purchased: "2024-12-23",
        status: "approved",
      },
    ],
  },
  {
    id_request: 1,
    title: "This is request #1",
    description: "This is the first request",
    requestor_name: "Grey",
    date_created: "2024-12-23",
    finance_status: "pending",
    items: [
      {
        name: "Item 1",
        price: 10000,
        date_purchased: "2024-12-22",
        status: "pending",
      },
      {
        name: "Item 2",
        price: 20000,
        date_purchased: "2024-12-23",
        status: "approved",
      },
    ],
  },
];

function exportExcel(data) {
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
  ];

  // Worksheet title
  ws.cell(2, 2, 3, 2 + columns.length - 1, true)
    .string("REPORT")
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

  wb.write("Export.xlsx");
}

exportExcel(data);
