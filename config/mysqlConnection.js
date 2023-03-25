const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.log("Mysql connection failed...");
    console.log(err);
  } else console.log("Mysql connect successfully!");
});

module.exports = connection;
