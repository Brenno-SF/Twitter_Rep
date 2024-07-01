require("dotenv").config();

const pass = process.env.PASSWORD;
// Get the client
const mysql = require("mysql2");

// Create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "app",
  password: pass,
});

module.exports = { connection };
