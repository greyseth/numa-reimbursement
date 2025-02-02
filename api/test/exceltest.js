const excel = require("excel4node");

const data = [
  {
    id_request: 15,
    title: "mytest2",
    description: "asldj",
    date_created: "1/2/2025",
    type: "petty cash",
    requestor_name: "User",
    finance_status: "pending",
    finance_image: "http://localhost:3001/img/null",
    items: [
      {
        id_request: 15,
        name: "123",
        price: 123,
        date_purchased: "1/2/2025",
        filename: "1738391657725_requestimg_ACourtOfSilveFlames.PDFdrive.pdf",
        status: "approved",
        category: "Perizinan dan Legalitas",
      },
    ],
  },
  {
    id_request: 16,
    title: "Approver's request",
    description: "made by an account that has verification role",
    date_created: "2/2/2025",
    type: "petty cash",
    requestor_name: "Approver",
    finance_status: "pending",
    finance_image: "http://localhost:3001/img/null",
    items: [],
  },
  {
    id_request: 17,
    title: "Finance's request",
    description: "Request created by user with finance role",
    date_created: "2/2/2025",
    type: "",
    requestor_name: "Finance",
    finance_status: "pending",
    finance_image: "http://localhost:3001/img/null",
    items: [],
  },
  {
    id_request: 18,
    title: "im gonna steal your heart, baby",
    description: "",
    date_created: "2/2/2025",
    type: "",
    requestor_name: "Greyseth",
    finance_status: "pending",
    finance_image: "http://localhost:3001/img/null",
    items: [
      {
        id_request: 18,
        name: "im gonna steal your heart, dont lie",
        price: 50000,
        date_purchased: "2/2/2025",
        filename:
          "1738470551011_requestimg_BUKTI_PERMANEN_SISWA_0077975285.jpg",
        status: "approved",
        category: "Penginapan",
      },
    ],
  },
  {
    id_request: 19,
    title: "my request 3",
    description: "",
    date_created: "2/2/2025",
    type: "petty cash",
    requestor_name: "Greyseth",
    finance_status: "pending",
    finance_image: "http://localhost:3001/img/null",
    items: [
      {
        id_request: 19,
        name: "test",
        price: 55555,
        date_purchased: "1/2/2025",
        filename: "1738470611936_requestimg_ACourtOfSilveFlames.PDFdrive.pdf",
        status: "approved",
        category: "Perizinan dan Legalitas",
      },
    ],
  },
];

function exportExcel(data, header) {
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
        label: "Items Invoice Doc",
        width: 250,
        value: "item_filename",
        centered: true,
      },
      {
        label: "Finance Approval",
        width: 165,
        value: "finance_status",
        centered: true,
      },
      {
        label: "Transaction Proof",
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

    wb.write("Export.xlsx");
  } catch (err) {
    console.log(err);
  }
}

exportExcel(data, "REPORT");
