// Autor: Luis Travaglini
// Registra mudanças de responsável, prioridade e prazo na edição de demandas.
// A conexão é compartilhada com a atualização para que as duas operações sejam atômicas.

async function nomeDoUsuario(conexao, id) {
    if (id == null) return null;
    const resultado = await conexao.execute("SELECT nome FROM usuarios WHERE id = :id", { id: Number(id) });
    return resultado.rows[0] ? resultado.rows[0][0] : null;
}

export async function registrarHistoricoEdicao(conexao, demandaId, usuarioId, anterior, atual) {
    if (!Number.isInteger(usuarioId) || usuarioId < 1) {
        throw new Error("É necessário identificar o usuário que fez a edição.");
    }

    const campos = [
        { chave: "responsavelId", nome: "responsavel" },
        { chave: "prioridade", nome: "prioridade" },
        { chave: "prazo", nome: "prazo" }
    ];

    for (const campo of campos) {
        let valorAnterior = anterior[campo.chave] == null ? null : String(anterior[campo.chave]);
        let valorNovo = atual[campo.chave] == null || atual[campo.chave] === "" ? null : String(atual[campo.chave]);
        if (valorAnterior !== valorNovo) {
            if (campo.chave === "responsavelId") {
                valorAnterior = await nomeDoUsuario(conexao, valorAnterior);
                valorNovo = await nomeDoUsuario(conexao, valorNovo);
            }
            await conexao.execute(
                `INSERT INTO historico_alteracoes
                 (demanda_id, usuario_id, campo, valor_anterior, valor_novo)
                 VALUES (:demandaId, :usuarioId, :campo, :valorAnterior, :valorNovo)`,
                { demandaId, usuarioId, campo: campo.nome, valorAnterior, valorNovo }
            );
        }
    }
}
