//Feito por Gabriel Souza Gonçalves

import { Router } from "express";
import { buscarUsuarioPorEmail, listarUsuarios } from "./usuarioBanco.js";

const router = Router();

const semSenha = ({ senha, ...resto }) => resto;

router.post("/login", async (req, res) => {
    const { email, senha } = req.body || {};

    if (!email || !senha) {
        return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    }

    const usuario = await buscarUsuarioPorEmail(String(email).trim());

    if (!usuario || usuario.senha !== senha) {
        return res.status(401).json({ erro: "Credenciais Inválidas" });
    }

    res.status(200).json({ usuario: semSenha(usuario) });
});

router.get("/usuarios", async (req, res) => {
    res.status(200).json(await listarUsuarios());
});

export default router;