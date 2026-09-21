// Autor: Arthur

import express from "express";

const app = express();
const PORT = 3000;

app.use(express.static("."));

app.get("/", (req, res) => {
    res.send("Servidor TRAK funcionando!");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});