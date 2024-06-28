const express = require("express");
const path = require("path");
const { connection } = require("./connection"); // Importando a conexão existente

const app = express();
const port = 3357;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const insert = "INSERT INTO Users (user_name, hash_password) VALUES (?, ?)";
const insertE = "INSERT INTO emails (email,fk_user) VALUES (?,? )";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/register", (request, response) => {
  const absolutePathRegister = path.join(__dirname, "public", "register.html");
  response.sendFile(absolutePathRegister);
});

app.post("/register", (request, response) => {
  const { name, dob, username, email, password } = request.body; // Tratar Senha Posteriormente (hash)
  connection.query(insert, [username, password], (err, result, fields) => {
    if (err instanceof Error) {
      console.log(err);
      return ;
    }

    const userId = result.insertId; // Obtém o id_user recém-criado

    connection.query(insertE, [email, userId], (err, result, fields) => {
      if (err instanceof Error) {
        console.log(err);
        return;
      }
      console.log(result);
      
      
      response.redirect("/user-timeline");

    });
  });
});

// Rota para exibir a timeline
app.get('/user-timeline', (req, res) => {
  const query = `
    SELECT thoughts.*, users.user_name as user_name
    FROM thoughts
    INNER JOIN users ON thoughts.fk_user = users.id_user
  `;

  connection.query(query, (err, data) => {
    if (err) {
      console.error('Erro ao buscar dados:', err);
      return ;
    }

    res.render('timeline', { data: data });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
