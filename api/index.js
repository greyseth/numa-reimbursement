const dotenv = require("dotenv");
const path = require("path");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authenticateToken = require("./middlewares/authenticateToken");
const verifyRole = require("./middlewares/verifyRole");
const { sendEmail } = require("./util/email/emailUtil");

dotenv.config();

const app = express();
app.use(cors());

// Testing
// app.get("/", (req, res) => {
//   sendEmail(
//     "",
//     {
//       title: "request",
//       description: "yes request",
//       type: "petty cash",
//       date_created: "00/00/0000",
//       status: "accepted",
//     },
//     (err, info) => {
//       if (err) return res.status(500).json({ error: err });
//       res.sendStatus(200);
//     }
//   );
// });

app.get("/img/:filename", async (req, res) => {
  res.sendFile(req.params.filename, {
    root: path.join(__dirname + "/uploads"),
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(authenticateToken);
app.use(verifyRole);

const usersRoute = require("./routes/users/users");
const requestsRoute = require("./routes/requests/requests");
const approvalRoute = require("./routes/requests/requests_approval");
const exportRoute = require("./routes/requests/requests_export");
const miscRoute = require("./routes/misc");
app.use("/", miscRoute);
app.use("/users", usersRoute);
app.use("/requests", requestsRoute);
app.use("/requests/approve", approvalRoute);
app.use("/requests/export", exportRoute);

app.listen(3001, () => {
  console.log("API is running");
});
