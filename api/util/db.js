const mysql = require("mysql2");

require("dotenv").config();

const connectionObject = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME,
  charset: "utf8mb4",
};

const connection = mysql.createConnection(connectionObject);

connection.connect();

module.exports = connection;
