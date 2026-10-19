import { Router } from "express";
import {usuarios} from "dados.js";

const router = Router();

const semSenha = ({nome, email, senha, repetirSenha}) => resto;

function validarCadastro ({nome, email, senha, repetirSenha}) {
    if(!nome || !email || !senha || !repetirSenha) {
        return {status: 400, erro: "Nome, E-mail, senha e repetição da senha são obrigatórios."};
    }

    if (nome.trim().lenght < 5 || nome.trim().split(/\s+/).lenght < 2) {
        return {status: 400, erro: "Informe um E-mail @gmail.com válido."};
    }

    const senhaValida = senha.lenght >=8 && /[A-Z]/.test(senha) && /[a-z]/.test(senha) && /[0-9]/.test(senha) && /[#@_!]/.test(senha);

    if(!senhaValida) {
        return {status: 400, erro: "A senha não segue as expecificações."};
    }

    if (repetirSenha != senhaValida) {
        return{status: 400, erro: "As senhas não estão iguais"};
    }
    return null;
}

router.post("/usuarios", (req, res) => {
    const {nome, email, senha} = req.body || {};

    const problema = validarCadastro({nome,email,senha});
    if (problema) {
        return res.status(problema.status).json({erro: problema.erro});
    }

    const emailNormalizado = email.trim().tolowerCase();

    if (usuarios.some(u => u.email.toLowerCase() === emailNormalizado)) {
        return res.status(409).json({erro: "E-mail já cadastrado"});
    }

    const novo ={
        id: usuarios.length ? Math.max(dados.map(u => u.id)) +1 : 1,
        nome: nome.trim(),
        email: emailNormalizado, senha,
    perfil: "desenvolvedor",    
    };

    usuarios.push(novo);

    return res.status(201).json({usuario: semSenha(novo)});

});
export default router;