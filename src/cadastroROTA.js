import { Router } from "express";
import { demandas, projetos, usuarios } from "./dados.js";

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

const tiposPermitidos = ["tarefa", "defeito", "melhoria", "documentacao"];
const prioridadesPermitidas = ["critica", "alta", "media", "baixa"];

function normalizarTexto(valor) {
    return String(valor)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function dataValida(data) {
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const [ano, mes, dia] = data.split("-").map(Number);
    const dataConvertida = new Date(Date.UTC(ano, mes - 1, dia));

    return dataConvertida.getUTCFullYear() === ano
        && dataConvertida.getUTCMonth() === mes - 1
        && dataConvertida.getUTCDate() === dia;
}

// Lista os projetos de teste disponíveis para cadastrar uma demanda.
router.get("/projetos", (req, res) => {
    return res.status(200).json(projetos);
});

// Cadastra uma demanda e valida os dados recebidos no corpo (body) da requisição.
router.post("/demandas", (req, res) => {
    const { titulo, descricao, tipo, prioridade, projetoId, responsavelId, prazo } = req.body || {};

    if (!titulo || !String(titulo).trim()) {
        return res.status(400).json({ erro: "O título é obrigatório." });
    }

    if (!descricao || !String(descricao).trim()) {
        return res.status(400).json({ erro: "A descrição é obrigatória." });
    }

    const tipoNormalizado = normalizarTexto(tipo);
    if (!tiposPermitidos.includes(tipoNormalizado)) {
        return res.status(400).json({
            erro: "Tipo inválido. Use Tarefa, Defeito, Melhoria ou Documentação."
        });
    }

    const prioridadeNormalizada = normalizarTexto(prioridade);
    if (!prioridadesPermitidas.includes(prioridadeNormalizada)) {
        return res.status(400).json({
            erro: "Prioridade inválida. Use Crítica, Alta, Média ou Baixa."
        });
    }

    const projetoIdNumero = Number(projetoId);
    const projetoExiste = Number.isInteger(projetoIdNumero)
        && projetos.some((projeto) => projeto.id === projetoIdNumero);

    if (!projetoExiste) {
        return res.status(400).json({ erro: "O projeto informado não existe." });
    }

    let responsavelIdNumero = null;
    if (responsavelId !== undefined && responsavelId !== null && responsavelId !== "") {
        responsavelIdNumero = Number(responsavelId);
        const responsavelExiste = Number.isInteger(responsavelIdNumero)
            && usuarios.some((usuario) => usuario.id === responsavelIdNumero);

        if (!responsavelExiste) {
            return res.status(400).json({ erro: "O responsável informado não existe." });
        }
    }

    if (prazo !== undefined && prazo !== null && prazo !== "" && !dataValida(prazo)) {
        return res.status(400).json({
            erro: "O prazo deve estar no formato AAAA-MM-DD e conter uma data válida."
        });
    }

    const agora = new Date().toISOString();
    const novaDemanda = {
        id: demandas.length ? Math.max(...demandas.map((demanda) => demanda.id)) + 1 : 1,
        titulo: String(titulo).trim(),
        descricao: String(descricao).trim(),
        tipo: tipoNormalizado,
        prioridade: prioridadeNormalizada,
        status: "aberta",
        projetoId: projetoIdNumero,
        responsavelId: responsavelIdNumero,
        dataCriacao: agora,
        dataAtualizacao: agora,
        prazo: prazo || ""
    };

    demandas.push(novaDemanda);

    return res.status(201).json(novaDemanda);
});

export default router;
