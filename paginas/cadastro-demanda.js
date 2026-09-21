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
