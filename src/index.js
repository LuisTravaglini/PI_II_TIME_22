// Autor: Arthur - 26000661

import express from "express";
import loginRota from "./loginROTA.js";           
import dashboardRota from "./dashboardROTA.js";   
import listagemRota from "./listagemROTA.js";     
import cadastroRota from "./cadastroROTA.js";     
import detalhesRota from "./detalhesROTA.js";  

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("paginas"));

app.use(loginRota);
app.use(dashboardRota);
app.use(listagemRota);
app.use(cadastroRota);
app.use(detalhesRota);

app.get("/", (req, res) => {
    res.send("Servidor TRAK funcionando!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});