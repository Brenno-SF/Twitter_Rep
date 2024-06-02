const express = require("express");
const path = require("path");
const app = express();
const port = 3357;
const { connection } = require("./connection");

const insert = "INSERT INTO Users (user_name, hash_password) VALUES (?, ?)";
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/register", (request, response) => {
  const absolutePath = path.join(__dirname, "public", "register.html");
  response.sendFile(absolutePath);
});

app.post("/register", (request, response) => {
  const { name, dob, username, email, password } = request.body; // Tratar Senha Posteriormente (hash)
  connection.query(insert, [username, password], (err, result, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return;
    }
    console.log(result);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
