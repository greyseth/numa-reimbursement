const mysql = require("mysql");

const connectionObject = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME,
};

const connection = mysql.createConnection(connectionObject);

connection.connect();

module.exports = connection;
