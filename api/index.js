const dotenv = require("dotenv");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authenticateToken = require("./middlewares/authenticateToken");
const generateToken = require("./util/generateToken");

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(authenticateToken);

const usersRoute = require("./routes/users/users");
app.use("/users", usersRoute);

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log("API is running");
});
