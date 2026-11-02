// Autor: Gabriel Souza Gonçalves
// Reunião 4 — API Backend do sistema TRAK.
// Este arquivo contém a rota de cadastro de usuários e suas validações.

import { Router } from "express";
import { buscarUsuarioPorEmail, cadastrarUsuario } from "./usuarioBanco.js";
import { PERFIS } from "./perfis.js";

const router = Router();

function validarCadastro ({nome, email, senha, repetirSenha}) {
    if(!nome || !email || !senha || !repetirSenha) {
        return {status: 400, erro: "Nome, E-mail, senha e repetição de senha são obrigatórios."};
    }

    if(senha !== repetirSenha) {
        return {status: 400, erro: "As senhas não coincidem."};
    }

    if (nome.trim().length < 5 || nome.trim().split(/\s+/).length < 2) {
        return {status: 400, erro: "Informe nome e sobrenome."};
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())){
        return {status: 400, erro: "Informe um E-mail @gmail.com válido."}
    }

    const senhaValida = senha.length >=8 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /[0-9]/.test(senha) && /[#@_!]/.test(senha);

    if(!senhaValida) {
        return {status: 400, erro: "A senha não segue as expecificações."};
    }

    return null;
}

router.post("/usuarios", async (req, res) => {
    const {nome, email, senha, repetirSenha} = req.body || {};

    const problema = validarCadastro({nome,email,senha, repetirSenha});
    if (problema) {
        return res.status(problema.status).json({erro: problema.erro});
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (await buscarUsuarioPorEmail(emailNormalizado)) {
        return res.status(409).json({erro: "E-mail já cadastrado"});
    }

    const novo = await cadastrarUsuario({ 
        nome: nome.trim(),
        email: emailNormalizado, senha,
        perfil: PERFIS.MEMBRO,    
    });

    return res.status(201).json({usuario:novo});

});

export default router;
