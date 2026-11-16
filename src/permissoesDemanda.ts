// Autor: Luís Felipe Travaglini
// Verifica o perfil autenticado e o vínculo do usuário com o projeto.
import { executarQuery } from "./bancoOracle.js";

const PERMISSOES = {
    administrador: ["criar_demanda", "editar_demanda", "alterar_status", "cancelar_demanda", "comentar"],
    lider: ["criar_demanda", "editar_demanda", "alterar_status", "cancelar_demanda", "comentar"],
    membro: ["alterar_status", "comentar"]
};

export function exigirPermissaoDemanda(acao) {
    return function (req, res, next) {
        if (!req.usuario) return res.status(401).json({ erro: "Faça login para continuar." });
        if (!(PERMISSOES[req.usuario.perfil] || []).includes(acao)) {
            return res.status(403).json({ erro: "Seu perfil não tem permissão para esta ação.", mensagem: "Seu perfil não tem permissão para esta ação." });
        }
        return next();
    };
}

export async function usuarioTemAcessoAoProjeto(usuario, projetoId) {
    if (!usuario || !Number.isInteger(Number(projetoId)) || Number(projetoId) < 1) return false;
    if (usuario.perfil === "administrador") return true;
    if (usuario.perfil !== "lider" && usuario.perfil !== "membro") return false;
    const resultado = await executarQuery(
        "SELECT 1 FROM usuarios_projetos WHERE usuario_id = :usuarioId AND projeto_id = :projetoId",
        { usuarioId: usuario.id, projetoId: Number(projetoId) }
    );
    return resultado.rows.length > 0;
}
