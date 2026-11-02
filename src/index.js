// Autor: Arthur - 26000661

import express from "express";
import { existsSync } from "node:fs";
import loginRota from "./loginROTA.js";           
import dashboardRota from "./dashboardROTA.js";   
import listagemRota from "./listagemROTA.js";     
import cadastroRota from "./cadastroROTA.js";     
import demandaRota from "./demandaROTA.js";
import detalhesRota from "./detalhesROTA.js";  
import statusRota from "./statusROTA.js";

const app = express();
const PORT = 3000;

if (existsSync(".env")) process.loadEnvFile(".env");

app.use(express.json());
app.use(express.static("paginas"));

app.use(statusRota);
app.use(loginRota);
app.use(dashboardRota);
app.use(listagemRota);
app.use(cadastroRota);
app.use(demandaRota);
app.use(detalhesRota);

app.get("/", (req, res) => {
    res.send("Servidor TRAK funcionando!");
});

app.use((erro,req,res,next) => {
    console.error("Erro:", erro.code || erro.message);
    res.status(503).json({erro: "Não foi possível acessar o banco de dados."});
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
