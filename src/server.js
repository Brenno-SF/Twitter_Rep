const express = require("express");
const app = express();
const { connection } = require("./connection");

app.use(express.json());
const selectThoughtsFromUser = "SELECT * FROM Thoughts WHERE fk_user = ?";
const sql = "SELECT * FROM Users;";

app.get("/", (request, response) => {
  response.sendFile("");
});
app.get("/register");

app.listen(3337, () => console.log("Server running"));
