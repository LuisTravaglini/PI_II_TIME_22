// Autor: Luís Felipe Travaglini
// Protege senhas com scrypt e identifica o usuário por token assinado.
import crypto from "node:crypto";
import { executarQuery } from "./bancoOracle.js";

const segredoTemporario = crypto.randomBytes(32).toString("hex");
const validadeMs = 8 * 60 * 60 * 1000;
const segredo = () => process.env.TRAK_TOKEN_SECRET || segredoTemporario;

export function gerarHash(senha) {
    const sal = crypto.randomBytes(16).toString("hex");
    return `scrypt$${sal}$${crypto.scryptSync(senha, sal, 64).toString("hex")}`;
}

export function senhaConfere(senha, guardada) {
    if (typeof senha !== "string" || typeof guardada !== "string") return false;
    if (guardada.startsWith("scrypt$")) {
        const partes = guardada.split("$");
        if (partes.length !== 3 || !/^[a-f0-9]{32}$/.test(partes[1]) || !/^[a-f0-9]{128}$/.test(partes[2])) return false;
        return crypto.timingSafeEqual(crypto.scryptSync(senha, partes[1], 64), Buffer.from(partes[2], "hex"));
    }
    // Compatibilidade temporária com as senhas de teste já cadastradas.
    const a = Buffer.from(senha);
    const b = Buffer.from(guardada);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function gerarToken(usuarioId) {
    if (!Number.isInteger(usuarioId) || usuarioId < 1) throw new Error("Usuário inválido.");
    const corpo = Buffer.from(JSON.stringify({ id: usuarioId, exp: Date.now() + validadeMs })).toString("base64url");
    const assinatura = crypto.createHmac("sha256", segredo()).update(corpo).digest("base64url");
    return `${corpo}.${assinatura}`;
}

function lerToken(token) {
    const partes = token.split(".");
    if (partes.length !== 2 || !partes[0] || !partes[1]) return null;
    const esperada = crypto.createHmac("sha256", segredo()).update(partes[0]).digest("base64url");
    const a = Buffer.from(partes[1]);
    const b = Buffer.from(esperada);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const dados = JSON.parse(Buffer.from(partes[0], "base64url").toString());
        return Number.isInteger(dados.id) && dados.id > 0 && Number.isFinite(dados.exp) && dados.exp > Date.now() ? dados : null;
    } catch { return null; }
}

export async function autenticar(req, res, next) {
    const cabecalho = req.headers.authorization || "";
    const dados = cabecalho.startsWith("Bearer ") ? lerToken(cabecalho.slice(7)) : null;
    const naoLogado = { erro: "Faça login para continuar.", mensagem: "Faça login para continuar." };
    if (!dados) return res.status(401).json(naoLogado);
    try {
        const resultado = await executarQuery(
            'SELECT id AS "id", nome AS "nome", email AS "email", perfil AS "perfil" FROM usuarios WHERE id = :id',
            { id: dados.id }
        );
        if (!resultado.rows[0]) return res.status(401).json(naoLogado);
        req.usuario = resultado.rows[0];
        return next();
    } catch (erro) {
        console.error("Erro ao autenticar:", erro.code || erro.message);
        return res.status(503).json({ erro: "Não foi possível verificar o login no banco." });
    }
}
