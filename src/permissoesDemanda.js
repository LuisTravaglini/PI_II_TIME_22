// Autor: Luis Travaglini
// Compatibilidade provisória com o padrão x-usuario-id combinado pela equipe.
// IMPORTANTE: um ID enviado pelo navegador pode ser alterado e não autentica o usuário.
// Substituir por sessão ou token validado pelo servidor antes de uso real.
import oracledb from "oracledb";
import { conectarOracle } from "./bancoOracle.js";

export function exigirPermissaoDemanda(acao) {
    return async function (req, res, next) {
        const id = Number(req.headers["x-usuario-id"]);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(401).json({ erro: "Faça login para continuar." });
        }
        let conexao;
        try {
            conexao = await conectarOracle();
            const resultado = await conexao.execute(
                'SELECT id AS "id", perfil AS "perfil" FROM usuarios WHERE id = :id',
                { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            const usuario = resultado.rows[0];
            if (!usuario) return res.status(401).json({ erro: "Usuário não encontrado. Faça login novamente." });
            const permissoes = {
                administrador: ["criar_demanda", "editar_demanda"],
                lider: ["criar_demanda", "editar_demanda"],
                membro: ["criar_demanda"]
            };
            if (!(permissoes[usuario.perfil] || []).includes(acao)) {
                return res.status(403).json({ erro: "Seu perfil não tem permissão para esta ação." });
            }
            req.usuario = usuario;
            return next();
        } catch (erro) {
            console.error("Erro ao verificar permissão:", erro.code);
            return res.status(503).json({ erro: "Não foi possível verificar a permissão no banco." });
        } finally {
            if (conexao) await conexao.close();
        }
    };
}
