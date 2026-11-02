//Criador: Gabriel Souza
import { buscarUsuarioPorId } from "./usuarioBanco.js";
import { perfilTemPermissao } from "./perfis.js";


export function exigirPermissao(permissao){
    return async function(req,res,next) {
        const id = Number(req.headers["x-usuario-id"]);
        let usuario = null;

        if (Number.isInteger(id)) {
            usuario = await buscarUsuarioPorId(id);
        }

        if (!usuario) {
            res.status(401).json({ erro: "Usuário não identificado. Faça login." });
        } else if (!perfilTemPermissao(usuario.perfil, permissao)) {
            res.status(403).json({ erro: "Seu perfil não tem permissão para esta ação." });
        } else {
            req.usuario = usuario;
            next();
        }
    };
}

