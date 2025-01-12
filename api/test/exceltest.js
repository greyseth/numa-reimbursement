const excel = require("excel4node");

const data = [
  {
    id_request: 2,
    title: "Like a Butterfly",
    description: "",
    date_created: "8/1/2025",
    requestor_name: "User",
    finance_status: "approved",
    items: [
      {
        id_request: 2,
        name: "so fly high",
        price: 150000,
        date_purchased: "8/1/2025",
        status: "approved",
      },
      {
        id_request: 2,
        name: "like a butterfly",
        price: 20000,
        date_purchased: "10/1/2025",
        status: "approved",
      },
    ],
  },
  {
    id_request: 3,
    title: "suki ni nareru hito wo",
    description: "suki ni nareta naraba",
    date_created: "9/1/2025",
    requestor_name: "User",
    finance_status: "approved",
    items: [
      {
        id_request: 3,
        name: "ai wo control dekita nara",
        price: 15000,
        date_purchased: "9/1/2025",
        status: "approved",
      },
      {
        id_request: 3,
        name: "dore dake raku ni naretan darou",
        price: 20000,
        date_purchased: "9/1/2025",
        status: "approved",
      },
      {
        id_request: 3,
        name: "joushiki-iro ame ga futari wo nijimaseru",
        price: 30000,
        date_purchased: "9/1/2025",
        status: "approved",
      },
    ],
  },
  {
    id_request: 4,
    title: "When this began",
    description: "",
    date_created: "11/1/2025",
    requestor_name: "User",
    finance_status: "approved",
    items: [
      {
        id_request: 4,
        name: "i had nothing to say",
        price: 10000,
        date_purchased: "11/1/2025",
        status: "approved",
      },
      {
        id_request: 4,
        name: "just stuck, hollow and alone and the fault is my own and the fault is my own",
        price: 20000,
        date_purchased: "11/1/2025",
        status: "approved",
      },
      {
        id_request: 4,
        name: "i wanna heal i wanna feel like im close to something real",
        price: 30000,
        date_purchased: "11/1/2025",
        status: "approved",
      },
    ],
  },
  {
    id_request: 5,
    title: "summer has come and past",
    description: "the innocent can never last",
    date_created: "11/1/2025",
    requestor_name: "User",
    finance_status: "pending",
    items: [
      {
        id_request: 5,
        name: "when September ends",
        price: 50000,
        date_purchased: "8/1/2025",
        status: "pending",
      },
    ],
  },
  {
    id_request: 6,
    title: "midnight shadow",
    description: "kirisaku akuseru",
    date_created: "12/1/2025",
    requestor_name: "User",
    finance_status: "approved",
    items: [
      {
        id_request: 6,
        name: "kishimu highway city",
        price: 25000,
        date_purchased: "12/1/2025",
        status: "approved",
      },
      {
        id_request: 6,
        name: "rouge iro no urei toida knife no youna",
        price: 12000,
        date_purchased: "12/1/2025",
        status: "approved",
      },
    ],
  },
  {
    id_request: 7,
    title: "Judgment",
    description: "i hope you haven't Lost your Judgment",
    date_created: "12/1/2025",
    requestor_name: "Greyseth",
    finance_status: "pending",
    items: [
      {
        id_request: 7,
        name: "Yagami",
        price: 250000,
        date_purchased: "11/1/2025",
        status: "pending",
      },
      {
        id_request: 7,
        name: "Kaito",
        price: 40000,
        date_purchased: "11/1/2025",
        status: "pending",
      },
    ],
  },
];

function exportExcel(data, header) {
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

  wb.write("Export.xlsx");
}

exportExcel(data, "REPORT");
