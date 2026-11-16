//Feito por Gabriel Souza Gonçalves

import { Router } from "express";
import { executarQuery } from "./bancoOracle.js";
import { autenticar, gerarHash, gerarToken, senhaConfere } from "./autenticacao.js";

const router = Router();

router.post("/login", async (req, res) => {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
        return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    }
    try {
        const resultado = await executarQuery(
            `SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil", senha AS "senha"
               FROM usuarios WHERE LOWER(email) = :email`,
            { email: String(email).trim().toLowerCase() }
        );
        const usuario = resultado.rows[0];
        if (!usuario || !senhaConfere(String(senha), usuario.senha)) {
            return res.status(401).json({ erro: "Credenciais inválidas." });
        }

        if (!usuario.senha.startsWith("scrypt$")) {
            await executarQuery("UPDATE usuarios SET senha = :senha WHERE id = :id",
                { senha: gerarHash(String(senha)), id: usuario.id });
        }
        const { senha: _senha, ...semSenha } = usuario;
        return res.status(200).json({ usuario: semSenha, token: gerarToken(usuario.id) });
    } catch (erro) {
        console.error("Erro no login:", erro.message);
        return res.status(503).json({ erro: "Não foi possível acessar o banco de dados." });
    }
});


router.get("/usuarios", autenticar, async (req, res) => {
    if (req.usuario.perfil !== "administrador") {
        return res.status(403).json({ erro: "Somente o Administrador pode listar os usuários." });
    }
    try {
        const resultado = await executarQuery(`SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil" FROM usuarios ORDER BY nome`);
        return res.status(200).json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao listar usuários:", erro.message);
        return res.status(503).json({ erro: "Não foi possível consultar os usuários." });
    }
});

export default router;