// FEITO POR: Arthur Alves Raymundi - 26000661
// Tela: Dashboard.
// Busca os dados na rota GET /dashboard do backend (que lê do banco Oracle)
// e preenche os cards, as barras e as listas. Nada aqui é número fixo.

// Nome bonito de cada valor, para mostrar na tela.
const nomesPrioridade = { critica: "Crítica", alta: "Alta", media: "Média", baixa: "Baixa" };
const nomesTipo = { tarefa: "Tarefa", defeito: "Defeito", melhoria: "Melhoria", documentacao: "Documentação" };

// Cor da barra de cada prioridade (as mesmas que já estavam no HTML).
const coresPrioridade = { critica: "#c0392b", alta: "#e67e22", media: "#1f4e79", baixa: "#27ae60" };
const corTipo = "#1f4e79";

// Troca os caracteres especiais do HTML. Os títulos vêm do banco e são digitados por usuários:
// sem isso, um título como "<script>..." seria executado na página.
function escaparHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

// Coloca um número dentro do elemento com esse id.
function mostrarValor(id, valor) {
    document.querySelector(`#${id}`).innerText = valor;
}

// Monta as barras de um painel (por prioridade ou por tipo).
function montarBarras(idPainel, contagens, nomes, cores) {
    const painel = document.querySelector(`#${idPainel}`);

    // A maior quantidade vira 100% da barra; as outras são proporcionais a ela.
    const maior = Math.max(...Object.values(contagens));

    let html = "";

    for (const chave in nomes) {
        const quantidade = contagens[chave];
        const largura = maior === 0 ? 0 : (quantidade / maior) * 100;
        const cor = typeof cores === "string" ? cores : cores[chave];

        html += `
            <div class="barra-linha">
                <span class="barra-rotulo">${nomes[chave]}</span>
                <div class="barra-trilho">
                    <div class="barra-preenchida" style="width: ${largura}%; background-color: ${cor};"></div>
                </div>
                <span class="barra-valor">${quantidade}</span>
            </div>`;
    }

    painel.innerHTML = html;
}

// Quantos dias faltam para o prazo (mesma conta do backend).
function diasAtePrazo(prazo) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataPrazo = new Date(`${prazo}T00:00:00`);
    const umDiaEmMilissegundos = 1000 * 60 * 60 * 24;

    return Math.round((dataPrazo - hoje) / umDiaEmMilissegundos);
}

// Texto do selo de prazo: "vence hoje", "em 1 dia", "em 3 dias".
function textoPrazo(prazo) {
    const dias = diasAtePrazo(prazo);

    if (dias === 0) {
        return "vence hoje";
    }

    if (dias === 1) {
        return "em 1 dia";
    }

    return `em ${dias} dias`;
}

// Monta uma lista de demandas (críticas ou próximas do prazo).
// Cada título é um link para a tela de detalhes daquela demanda.
function montarLista(idPainel, demandas, mensagemVazia, criarSelo) {
    const painel = document.querySelector(`#${idPainel}`);

    if (demandas.length === 0) {
        painel.innerHTML = `<p class="lista-texto">${mensagemVazia}</p>`;
        return;
    }

    let html = "";

    for (const demanda of demandas) {
        html += `
            <div class="lista-linha">
                <span class="lista-texto">
                    <a href="detalhes-demanda.html?id=${demanda.id}">${escaparHtml(demanda.titulo)}</a>
                </span>
                ${criarSelo(demanda)}
            </div>`;
    }

    painel.innerHTML = html;
}

// Mostra o erro na própria página (e não só no console).
function mostrarErro(mensagem) {
    document.querySelector("#erroDashboard").innerText = mensagem;
}

async function carregarDashboard() {
    let resposta;

    // 1. Pede os dados para o backend. Se o servidor estiver desligado, o fetch falha aqui.
    try {
        resposta = await fetch("/dashboard");
    } catch (erro) {
        console.error(erro);
        mostrarErro("Não foi possível conectar ao servidor. Verifique se ele está rodando.");
        return;
    }

    // 2. Transforma o texto JSON em objeto JavaScript.
    const dados = await resposta.json().catch(() => ({}));

    // 3. Se a API respondeu com erro (ex.: 503 quando o banco está fora), mostra a mensagem dela.
    if (!resposta.ok) {
        mostrarErro(dados.erro || `Erro ${resposta.status} ao carregar o dashboard.`);
        return;
    }

    // 4. Cards do topo.
    mostrarValor("valorTotal", dados.total);
    mostrarValor("valorAbertas", dados.porStatus.aberta);
    mostrarValor("valorAndamento", dados.porStatus.andamento);
    mostrarValor("valorRevisao", dados.porStatus.revisao);
    mostrarValor("valorConcluidas", dados.porStatus.concluida);
    mostrarValor("valorCanceladas", dados.porStatus.cancelada);

    // 5. Barras.
    montarBarras("barrasPrioridade", dados.porPrioridade, nomesPrioridade, coresPrioridade);
    montarBarras("barrasTipo", dados.porTipo, nomesTipo, corTipo);

    // 6. Listas.
    montarLista("listaCriticas", dados.criticasEmAberto, "Nenhuma demanda crítica em aberto.", function () {
        return `<span class="badge badge-critica">Crítica</span>`;
    });

    montarLista("listaPrazo", dados.proximasDoPrazo, "Nenhuma demanda vence nos próximos 7 dias.", function (demanda) {
        return `<span class="badge badge-prazo">${textoPrazo(demanda.prazo)}</span>`;
    });
}

// Quando a página terminar de carregar, busca os dados.
document.addEventListener("DOMContentLoaded", carregarDashboard);
