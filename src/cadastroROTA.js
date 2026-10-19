import { Router } from "express";
import {usuarios} from "./dados.js";

const router = Router();

const semSenha = ({senha, ...resto }) => resto;

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

router.post("/usuarios", (req, res) => {
    const {nome, email, senha, repetirSenha} = req.body || {};

    const problema = validarCadastro({nome,email,senha, repetirSenha});
    if (problema) {
        return res.status(problema.status).json({erro: problema.erro});
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (usuarios.some(u => u.email.toLowerCase() === emailNormalizado)) {
        return res.status(409).json({erro: "E-mail já cadastrado"});
    }

    const novo ={
        id: usuarios.length ? Math.max(...usuarios.map(u => u.id)) +1 : 1,
        nome: nome.trim(),
        email: emailNormalizado, senha,
        perfil: "desenvolvedor",    
    };

    usuarios.push(novo);

    return res.status(201).json({usuario: semSenha(novo)});

});

export default router;