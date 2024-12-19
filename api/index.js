const dotenv = require("dotenv");
const path = require("path");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authenticateToken = require("./middlewares/authenticateToken");
const verifyRole = require("./middlewares/verifyRole");

dotenv.config();

const app = express();

app.get("/img/:filename", async (req, res) => {
  res.sendFile(req.params.filename, {
    root: path.join(__dirname + "/uploads"),
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(authenticateToken);
app.use(verifyRole);

const usersRoute = require("./routes/users/users");
const requestsRoute = require("./routes/requests/requests");
const approvalRoute = require("./routes/requests/requests_approval");
app.use("/users", usersRoute);
app.use("/requests", requestsRoute);
app.use("/requests/approve", approvalRoute);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log("API is running");
});
