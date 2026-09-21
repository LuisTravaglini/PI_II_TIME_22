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

formulario.addEventListener("submit", function (event) {
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

    if (!validarSelecao(campoProjeto, erroProjeto, ["trak", "site"], "projeto")) {
        formularioValido = false;
    }

    if (!validarSelecao(campoPrioridade, erroPrioridade, ["baixa", "media", "alta", "critica"], "prioridade")) {
        formularioValido = false;
    }

    if (!validarSelecao(campoResponsavel, erroResponsavel, ["arthur", "gabriel", "luis", "joao", "equipe"], "responsável")) {
        formularioValido = false;
    }

    if (!validarSelecao(campoStatus, erroStatus, ["aberta", "andamento", "revisao", "concluida", "cancelada"], "status")) {
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

    resultadoValidacao.classList.remove("d-none");
});
