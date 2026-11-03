// FEITO POR: Luis Felippe Travaglini
// Tela: Cadastro e edição de demanda.
// Valida título, descrição, seleções obrigatórias e prazo previsto.

const formulario = document.querySelector("#formDemanda");

const campoTitulo = document.querySelector("#titulo");
const campoTipo = document.querySelector("#tipo");
const campoProjeto = document.querySelector("#projeto");
const campoDescricao = document.querySelector("#descricao");
const campoPrioridade = document.querySelector("#prioridade");
const campoResponsavel = document.querySelector("#responsavel");
const campoPrazo = document.querySelector("#prazo");
const campoStatus = document.querySelector("#status");

const erroTitulo = document.querySelector("#erroTitulo");
const erroTipo = document.querySelector("#erroTipo");
const erroProjeto = document.querySelector("#erroProjeto");
const erroDescricao = document.querySelector("#erroDescricao");
const erroPrioridade = document.querySelector("#erroPrioridade");
const erroResponsavel = document.querySelector("#erroResponsavel");
const erroPrazo = document.querySelector("#erroPrazo");
const erroStatus = document.querySelector("#erroStatus");
const resultadoValidacao = document.querySelector("#resultadoValidacao");

const camposComErro = [
    campoTitulo,
    campoTipo,
    campoProjeto,
    campoDescricao,
    campoPrioridade,
    campoResponsavel,
    campoPrazo,
    campoStatus
];

const mensagensDeErro = [
    erroTitulo,
    erroTipo,
    erroProjeto,
    erroDescricao,
    erroPrioridade,
    erroResponsavel,
    erroPrazo,
    erroStatus
];

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.innerText = mensagem;
}

function limparErros() {
    camposComErro.forEach(function (campo) {
        campo.classList.remove("is-invalid");
    });

    mensagensDeErro.forEach(function (elementoErro) {
        elementoErro.innerText = "";
    });
}

function validarSelecao(campo, elementoErro, valoresPermitidos, nomeCampo) {
    if (!valoresPermitidos.includes(campo.value)) {
        mostrarErro(campo, elementoErro, `Selecione um valor válido para ${nomeCampo}.`);
        return false;
    }

    return true;
}

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();
    limparErros();
    resultadoValidacao.classList.add("d-none");

    const titulo = campoTitulo.value.trim();
    const descricao = campoDescricao.value.trim();
    const prazo = campoPrazo.value;
    let formularioValido = true;

    if (titulo === "") {
        mostrarErro(campoTitulo, erroTitulo, "O título é obrigatório.");
        formularioValido = false;
    } else if (titulo.length < 5) {
        mostrarErro(campoTitulo, erroTitulo, "O título deve ter pelo menos 5 caracteres.");
        formularioValido = false;
    }

    if (descricao === "") {
        mostrarErro(campoDescricao, erroDescricao, "A descrição é obrigatória.");
        formularioValido = false;
    } else if (descricao.length < 15) {
        mostrarErro(campoDescricao, erroDescricao, "A descrição deve ter pelo menos 15 caracteres.");
        formularioValido = false;
    }

    if (!validarSelecao(campoTipo, erroTipo, ["tarefa", "defeito", "melhoria", "documentacao"], "tipo")) {
        formularioValido = false;
    }

    if (!campoProjeto.value || !Array.from(campoProjeto.options).some(opcao => opcao.value === campoProjeto.value)) {
        mostrarErro(campoProjeto, erroProjeto, "Selecione um projeto válido.");
        formularioValido = false;
    }

    if (!validarSelecao(campoPrioridade, erroPrioridade, ["baixa", "media", "alta", "critica"], "prioridade")) {
        formularioValido = false;
    }

    if (prazo !== "") {
        const dataPrazo = new Date(`${prazo}T00:00:00`);
        const hoje = new Date();

        hoje.setHours(0, 0, 0, 0);

        if (Number.isNaN(dataPrazo.getTime()) || dataPrazo < hoje) {
            mostrarErro(campoPrazo, erroPrazo, "O prazo não pode ser uma data anterior a hoje.");
            formularioValido = false;
        }
    }

    if (!formularioValido) {
        return;
    }

    // Mesmo nome de armazenamento e header combinados com o login do grupo.
    let usuario;
    try {
        usuario = JSON.parse(sessionStorage.getItem("usuario") || localStorage.getItem("usuario") || "null");
    } catch (erro) {
        usuario = null;
    }
    if (!usuario || !usuario.id) {
        mostrarResultado("Faça login antes de salvar a demanda.", true);
        return;
    }

    const dados = {
        titulo, descricao, tipo: campoTipo.value, prioridade: campoPrioridade.value,
        projetoId: Number(campoProjeto.value),
        responsavelId: campoResponsavel.value ? Number(campoResponsavel.value) : null,
        prazo
    };
    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
        await requisitar(idDemanda ? `/demandas/${encodeURIComponent(idDemanda)}` : "/demandas", {
            method: idDemanda ? "PUT" : "POST",
            headers: { "Content-Type": "application/json", "x-usuario-id": String(usuario.id) },
            body: JSON.stringify(dados)
        });
        mostrarResultado(idDemanda ? "Demanda atualizada com sucesso." : "Demanda cadastrada com sucesso.");
        if (!idDemanda) formulario.reset();
    } catch (erro) {
        mostrarResultado(`Não foi possível salvar: ${erro.message}`, true);
    } finally {
        botao.disabled = false;
    }
});

// O parâmetro ?id= identifica a demanda quando a tela é aberta para edição.
const idDemanda = new URLSearchParams(window.location.search).get("id");

function mostrarResultado(mensagem, erro = false) {
    resultadoValidacao.textContent = mensagem;
    resultadoValidacao.classList.remove("d-none", "alert-success", "alert-danger");
    resultadoValidacao.classList.add(erro ? "alert-danger" : "alert-success");
}

async function requisitar(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || "Erro na requisição.");
    return dados;
}

function adicionarOpcoes(campo, itens) {
    itens.forEach(function (item) {
        const opcao = document.createElement("option");
        opcao.value = item.id;
        opcao.textContent = item.nome;
        campo.appendChild(opcao);
    });
}

async function carregarFormulario() {
    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;
    try {
        adicionarOpcoes(campoProjeto, await requisitar("/projetos"));
        adicionarOpcoes(campoResponsavel, await requisitar("/cadastro/usuarios"));
        if (idDemanda) {
            const demanda = await requisitar(`/cadastro/demandas/${encodeURIComponent(idDemanda)}`);
            document.querySelector("h1").textContent = "Edição de demanda";
            document.querySelector(".caminho span").textContent = "Editar demanda";
            document.querySelector(".subtitulo").textContent = "Atualize as informações da demanda.";
            campoTitulo.value = demanda.titulo;
            campoDescricao.value = demanda.descricao;
            campoTipo.value = demanda.tipo;
            campoProjeto.value = demanda.projetoId;
            campoPrioridade.value = demanda.prioridade;
            campoResponsavel.value = demanda.responsavelId || "";
            campoPrazo.value = demanda.prazo ? demanda.prazo.slice(0, 10) : "";
            campoStatus.value = demanda.status;
        }
        botao.disabled = false;
    } catch (erro) {
        mostrarResultado(`Não foi possível carregar o formulário: ${erro.message}`, true);
    }
}

carregarFormulario();
