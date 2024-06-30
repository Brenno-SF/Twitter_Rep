const express = require("express");
const path = require("path");
const { connection } = require("./connection"); // Importando a conexão existente
const { builtinModules } = require("module");
const { Console } = require("console");
const session = require('express-session');
const app = express();
const port = 3357;

//sessão pra salvar userId
app.use(session({
  secret: '1307',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const insert = "INSERT INTO Users (user_name, hash_password) VALUES (?, ?)";
const insertE = "INSERT INTO emails (email,fk_user) VALUES (?,? )";
const selectUser = "SELECT * FROM Users WHERE user_name = ?";
const insertPost = "INSERT INTO Thoughts (content, fk_user) VALUES (?, ?)";

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
      return;
    }
    
    const userId = result.insertId; // Obtém o id_user recém-criado

    connection.query(insertE, [email, userId], (err, result, fields) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(result);
      
    });
    if (result) {
      response.redirect("/login");
    }
  });
});

app.get("/login", (request, response) => {
  const absolutePathLogin = path.join(__dirname, "public", "index.html");
  response.sendFile(absolutePathLogin);
});

app.post("/login", (request, response) =>{
  
  const {username, password} = request.body;
  console.log("Dados recebidos:", username, password);
  connection.query(selectUser,[username],(err, result, fields)=> {
    if(err){
      console.log(err);
      return;
    }
    console.log(result);
    if (result.length > 0) {
      const user = result[0];
      
      if (password === user.hash_password) {
        request.session.userId = user.id_user;
        request.session.username = user.user_name;
        response.redirect("/timeline");
      } else {
        response.send("Usuário ou senha incorretos.");
      }
    } else {
      response.send("Usuário ou senha incorretos.");
    }
  })
})

// Rota para exibir a timeline
app.get('/timeline', (req, res) => {
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

    res.render('timeline', { data: data, username: req.session.username});
  });
});

app.post('/timeline', (request, res)=>{
  console.log("test");
  const {content} = request.body;
  const userId = request.session.userId;
  console.log("Dados recebidos:", content, userId);


  if (!userId) {
    return res.status(401).send("Usuário não autorizado.");
  }
  connection.query(insertPost,[content, userId],(err, result)=> {
    if(err){
      console.log(err);
      return;
    }
    if (result) {
      console.log(result);
      res.redirect('/timeline');
    }
    
  })
})


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
 