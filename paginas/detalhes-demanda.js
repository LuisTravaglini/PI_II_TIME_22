// Tela de detalhes da demanda.
// Busca os dados nas rotas do detalhesROTA.js e preenche a página.
// A demanda vem da URL: detalhes-demanda.html?id=2

const demandaId = Number(new URLSearchParams(window.location.search).get("id"));

const ROTULO_STATUS = {
    aberta: "Aberta",
    andamento: "Em andamento",
    revisao: "Em revisão",
    concluida: "Concluída",
    cancelada: "Cancelada"
};
const ROTULO_PRIORIDADE = { critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa" };
const ROTULO_TIPO = { tarefa: "Tarefa", defeito: "Defeito", melhoria: "Melhoria", documentacao: "Documentação" };

// Botões de ação de cada status (as mesmas transições que a API aceita).
const ACOES_POR_STATUS = {
    aberta: [{ texto: "Iniciar demanda", novoStatus: "andamento", classe: "btn-outline-primary" }],
    andamento: [{ texto: "Enviar para revisão", novoStatus: "revisao", classe: "btn-outline-primary" }],
    revisao: [
        { texto: "Concluir demanda", novoStatus: "concluida", classe: "btn-outline-success" },
        { texto: "Devolver para andamento", novoStatus: "andamento", classe: "btn-outline-secondary" }
    ],
    concluida: [],
    cancelada: []
};

const el = (id) => document.getElementById(id);

// ---------- utilidades ----------

function mostrarErro(mensagem) {
    el("erroDetalhes").textContent = mensagem;
    el("erroDetalhes").classList.remove("d-none");
}

function limparErro() {
    el("erroDetalhes").textContent = "";
    el("erroDetalhes").classList.add("d-none");
}

// Pega o usuário que o login guardou no navegador.
// ATENÇÃO: confirme com o login.js o nome da chave ("usuario") usada no armazenamento.
function obterUsuarioLogado() {
    for (const armazenamento of [sessionStorage, localStorage]) {
        try {
            const texto = armazenamento.getItem("usuario");
            if (texto) return JSON.parse(texto);
        } catch (erro) {
            // ignora e tenta o próximo
        }
    }
    return null;
}

async function chamarApi(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    let corpo = null;
    try {
        corpo = await resposta.json();
    } catch (erro) {
        // resposta sem corpo
    }
    if (!resposta.ok) {
        throw new Error((corpo && (corpo.mensagem || corpo.erro)) || "Erro ao falar com o servidor.");
    }
    return corpo;
}

function enviarJson(metodo, dados) {
    return {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    };
}

function formatarDataHora(valor) {
    const data = new Date(valor);
    return Number.isNaN(data.getTime())
        ? "-"
        : data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// O prazo vem como "AAAA-MM-DD"; separa o texto para não sofrer mudança de fuso.
function formatarPrazo(valor) {
    if (!valor) return "Sem prazo";
    const [ano, mes, dia] = String(valor).slice(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
}

function nomePorId(lista, id) {
    const item = lista.find((x) => x.id === id);
    return item ? item.nome : "-";
}

// ---------- preenchimento da tela ----------

function preencherDemanda(demanda, projetos, usuarios) {
    el("tituloPagina").textContent = demanda.titulo;
    el("tituloDemanda").textContent = demanda.titulo;
    el("codigoDemanda").textContent = `#DM-${String(demanda.id).padStart(3, "0")}`;

    el("badgeStatus").textContent = ROTULO_STATUS[demanda.status] || demanda.status;
    el("badgeStatus").className = `badge status-${demanda.status}`;

    el("badgePrioridade").textContent = ROTULO_PRIORIDADE[demanda.prioridade] || demanda.prioridade;
    el("badgePrioridade").className = `badge prioridade-${demanda.prioridade}`;

    el("campoTipo").textContent = ROTULO_TIPO[demanda.tipo] || demanda.tipo;
    el("campoProjeto").textContent = nomePorId(projetos, demanda.projetoId);
    el("campoResponsavel").textContent = demanda.responsavelId
        ? nomePorId(usuarios, demanda.responsavelId)
        : "Sem responsável";
    el("campoCriacao").textContent = formatarDataHora(demanda.dataCriacao);
    el("campoAtualizacao").textContent = formatarDataHora(demanda.dataAtualizacao);
    el("campoPrazo").textContent = formatarPrazo(demanda.prazo);

    // textContent evita que texto digitado vire HTML.
    el("textoDescricao").textContent = demanda.descricao;

    el("linkEditar").href = `cadastro-demanda.html?id=${demanda.id}`;
    montarAcoes(demanda.status);
}

function montarAcoes(status) {
    const area = el("botoesAcoes");
    area.querySelectorAll("button").forEach((botao) => botao.remove());

    for (const acao of ACOES_POR_STATUS[status] || []) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = `btn ${acao.classe}`;
        botao.textContent = acao.texto;
        botao.addEventListener("click", () => mudarStatus(acao.novoStatus));
        area.appendChild(botao);
    }

    if (status !== "concluida" && status !== "cancelada") {
        const cancelar = document.createElement("button");
        cancelar.type = "button";
        cancelar.className = "btn btn-outline-danger";
        cancelar.textContent = "Cancelar demanda";
        cancelar.addEventListener("click", cancelarDemanda);
        area.appendChild(cancelar);
    }
}

function preencherComentarios(comentarios) {
    const lista = el("listaComentarios");
    lista.replaceChildren();

    el("contadorComentarios").textContent =
        comentarios.length === 1 ? "1 comentário" : `${comentarios.length} comentários`;

    if (comentarios.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "texto-apoio";
        vazio.textContent = "Nenhum comentário ainda.";
        lista.appendChild(vazio);
        return;
    }

    for (const c of comentarios) {
        const bloco = document.createElement("div");
        bloco.className = "comentario";

        const topo = document.createElement("div");
        topo.className = "d-flex justify-content-between align-items-center mb-2";

        const autor = document.createElement("strong");
        autor.textContent = c.usuarioNome;

        const data = document.createElement("span");
        data.className = "data-comentario";
        data.textContent = formatarDataHora(c.dataHora);

        topo.append(autor, data);

        const texto = document.createElement("p");
        texto.className = "mb-0";
        texto.style.whiteSpace = "pre-wrap";
        texto.textContent = c.texto;

        bloco.append(topo, texto);
        lista.appendChild(bloco);
    }
}

function preencherHistorico(itens) {
    const lista = el("listaHistorico");
    lista.replaceChildren();

    if (itens.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "texto-apoio";
        vazio.textContent = "Nenhuma alteração registrada.";
        lista.appendChild(vazio);
        return;
    }

    for (const h of itens) {
        const item = document.createElement("div");
        item.className = "historico-item";

        const ponto = document.createElement("div");
        ponto.className = "historico-ponto";

        const conteudo = document.createElement("div");
        conteudo.className = "historico-conteudo";

        const titulo = document.createElement("strong");
        titulo.textContent = `${h.usuario} ${h.descricao}.`;

        const data = document.createElement("span");
        data.textContent = formatarDataHora(h.dataHora);

        conteudo.append(titulo, data);
        item.append(ponto, conteudo);
        lista.appendChild(item);
    }
}

// ---------- ações ----------

async function mudarStatus(novoStatus) {
    limparErro();
    const usuario = obterUsuarioLogado();
    if (!usuario) {
        mostrarErro("Faça login novamente para alterar a demanda.");
        return;
    }
    try {
        await chamarApi(
            `/demandas/${demandaId}/status`,
            enviarJson("PATCH", { novoStatus, usuarioId: usuario.id })
        );
        await carregarTudo();
    } catch (erro) {
        mostrarErro(erro.message);
    }
}

async function cancelarDemanda() {
    limparErro();
    if (!window.confirm("Tem certeza que deseja cancelar esta demanda?")) return;

    const usuario = obterUsuarioLogado();
    if (!usuario) {
        mostrarErro("Faça login novamente para alterar a demanda.");
        return;
    }
    try {
        await chamarApi(
            `/demandas/${demandaId}/cancelar`,
            enviarJson("PATCH", { usuarioId: usuario.id })
        );
        await carregarTudo();
    } catch (erro) {
        mostrarErro(erro.message);
    }
}

async function adicionarComentario() {
    limparErro();
    const campo = el("comentario");
    const texto = campo.value.trim();

    if (!texto) {
        mostrarErro("O comentário não pode estar vazio.");
        return;
    }
    const usuario = obterUsuarioLogado();
    if (!usuario) {
        mostrarErro("Faça login novamente para comentar.");
        return;
    }
    try {
        await chamarApi(
            `/demandas/${demandaId}/comentarios`,
            enviarJson("POST", { usuarioId: usuario.id, texto })
        );
        campo.value = "";
        await carregarTudo();
    } catch (erro) {
        mostrarErro(erro.message);
    }
}

// ---------- carga inicial ----------

async function carregarTudo() {
    try {
        const [demanda, comentarios, historico, projetos, usuarios] = await Promise.all([
            chamarApi(`/demandas/${demandaId}`),
            chamarApi(`/demandas/${demandaId}/comentarios`),
            chamarApi(`/demandas/${demandaId}/historico`),
            chamarApi("/projetos"),
            chamarApi("/cadastro/usuarios")
        ]);

        preencherDemanda(demanda, projetos, usuarios);
        preencherComentarios(comentarios);
        preencherHistorico(historico);
    } catch (erro) {
        mostrarErro(erro.message);
    }
}

if (!Number.isInteger(demandaId) || demandaId < 1) {
    mostrarErro("Demanda não informada. Abra esta página pela listagem.");
} else {
    el("btnComentar").addEventListener("click", adicionarComentario);
    carregarTudo();
}