//Feito por Gabriel Souza Gonçalves

import {Router} from "express";
import {usuarios} from "./dados.js"

const router = Router();

const semSenha = ({senha, ...resto }) => resto;

router.post("/login", (req, res) => {
    const {email, senha} = req.body || {};

    if(!email || !senha) {
        return res.status(400).json({ erro: "E-mail e senha são obrigatórios."});
    }

    const usuario = usuarios.find(u => u.email === email && u.senha === senha );

    if(!usuario) {
        return res.status(401).json({ erro: "Credenciais Inválidas"});
    }

    res.status(200).json({usuario: semSenha(usuario)});
});

router.get("/usuarios", (req, res) => {
    res.status(200).json(usuarios.map(semSenha));
});

export default router;