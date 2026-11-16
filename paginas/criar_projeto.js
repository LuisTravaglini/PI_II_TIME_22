// Feito por: Gabriel Souza

const formulario = document.querySelector("#formProjeto");
const campoNome = document.querySelector("#nome");
const erroNome = document.querySelector("#erroNome");
const contadorNome = document.querySelector("#contadorNome");
const listaMembros = document.querySelector("#listaMembros");
const botaoSelecionarTodos = document.querySelector("#botaoSelecionarTodos");
const contadorMembros = document.querySelector("#contadorMembros");
const erroMembros = document.querySelector("#erroMembros");
const resultadoProjeto = document.querySelector("#resultadoProjeto");
const botaoSalvar = formulario.querySelector('button[type="submit"]');

const TAMANHO_MINIMO = 3;
const TAMANHO_MAXIMO = 150; // mesmo limite da coluna projetos.nome no Oracle

// Nomes dos projetos que a pessoa já enxerga, para avisar de duplicidade antes de enviar.
let projetosExistentes = [];

function mostrarErro(mensagem) {
    campoNome.classList.add("is-invalid");
    erroNome.textContent = mensagem;
}

function limparErros() {
    campoNome.classList.remove("is-invalid");
    erroNome.textContent = "";
    erroMembros.textContent = "";
}

function mostrarResultado(mensagem, erro = false) {
    resultadoProjeto.textContent = mensagem;
    resultadoProjeto.classList.remove("d-none", "alert-success", "alert-danger");
    resultadoProjeto.classList.add(erro ? "alert-danger" : "alert-success");
}

async function requisitar(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    const dados = await resposta.json().catch(function () { return {}; });
    if (!resposta.ok) throw new Error(dados.erro || dados.mensagem || "Erro na requisição.");
    return dados;
}

// Remove espaços repetidos e compara sem diferenciar maiúsculas, minúsculas e acentos.
function normalizar(texto) {
    return texto
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

function validarNome() {
    const nome = campoNome.value.trim().replace(/\s+/g, " ");

    if (nome === "") {
        mostrarErro("O nome do projeto é obrigatório.");
        return false;
    }

    if (nome.length < TAMANHO_MINIMO) {
        mostrarErro(`O nome deve ter pelo menos ${TAMANHO_MINIMO} caracteres.`);
        return false;
    }

    if (nome.length > TAMANHO_MAXIMO) {
        mostrarErro(`O nome deve ter no máximo ${TAMANHO_MAXIMO} caracteres.`);
        return false;
    }

    if (projetosExistentes.includes(normalizar(nome))) {
        mostrarErro("Já existe um projeto com esse nome.");
        return false;
    }

    return true;
}

function idsMembrosSelecionados() {
    return Array.from(listaMembros.querySelectorAll('input[type="checkbox"]:checked'))
        .map(function (caixa) { return Number(caixa.value); });
}

function todasCaixas() {
    return Array.from(listaMembros.querySelectorAll('input[type="checkbox"]'));
}

// Atualiza o contador e o texto do botão conforme as caixas marcadas.
function atualizarSelecao() {
    const caixas = todasCaixas();
    const marcadas = caixas.filter(function (caixa) { return caixa.checked; }).length;

    contadorMembros.textContent = marcadas === 1 ? "1 selecionado" : `${marcadas} selecionados`;
    botaoSelecionarTodos.disabled = caixas.length === 0;
    botaoSelecionarTodos.textContent = caixas.length > 0 && marcadas === caixas.length
        ? "Desmarcar todos"
        : "Selecionar todos";
}

botaoSelecionarTodos.addEventListener("click", function () {
    const caixas = todasCaixas();
    const marcarTodas = !caixas.every(function (caixa) { return caixa.checked; });

    caixas.forEach(function (caixa) { caixa.checked = marcarTodas; });
    atualizarSelecao();
});

listaMembros.addEventListener("change", atualizarSelecao);

// O reset do formulário desmarca as caixas depois do evento, então a contagem é refeita em seguida.
formulario.addEventListener("reset", function () {
    setTimeout(atualizarSelecao, 0);
});

function desenharMembros(usuarios) {
    listaMembros.textContent = "";

    if (usuarios.length === 0) {
        const aviso = document.createElement("p");
        aviso.className = "texto-apoio mb-0";
        aviso.textContent = "Nenhuma pessoa disponível para vincular.";
        listaMembros.appendChild(aviso);
        atualizarSelecao();
        return;
    }

    usuarios.forEach(function (usuario) {
        const rotulo = document.createElement("label");
        rotulo.className = "membro";

        const caixa = document.createElement("input");
        caixa.type = "checkbox";
        caixa.value = usuario.id;
        caixa.name = "membros";

        const nome = document.createElement("span");
        nome.textContent = usuario.nome; // textContent evita injetar HTML vindo do banco

        rotulo.append(caixa, nome);
        listaMembros.appendChild(rotulo);
    });

    atualizarSelecao();
}

// Líder e Administrador criam projetos; o Membro da equipe só acompanha as demandas.
function perfilPodeCriar() {
    const usuario = TRAK_AUTH.usuario();
    return Boolean(usuario) && usuario.perfil !== "membro";
}

campoNome.addEventListener("input", function () {
    contadorNome.textContent = `${campoNome.value.length}/${TAMANHO_MAXIMO}`;
    if (campoNome.classList.contains("is-invalid")) {
        limparErros();
    }
});

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();
    limparErros();
    resultadoProjeto.classList.add("d-none");

    if (!perfilPodeCriar()) {
        mostrarResultado("Seu perfil não tem permissão para criar projetos.", true);
        return;
    }

    if (!validarNome()) {
        campoNome.focus();
        return;
    }

    const nome = campoNome.value.trim().replace(/\s+/g, " ");
    botaoSalvar.disabled = true;

    try {
        await requisitar("/projetos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, membros: idsMembrosSelecionados() })
        });

        projetosExistentes.push(normalizar(nome));
        mostrarResultado("Projeto criado com sucesso.");
        formulario.reset();
        contadorNome.textContent = `0/${TAMANHO_MAXIMO}`;
    } catch (erro) {
        mostrarResultado(`Não foi possível criar o projeto: ${erro.message}`, true);
    } finally {
        botaoSalvar.disabled = false;
    }
});

async function carregarTela() {
    if (!perfilPodeCriar()) {
        botaoSalvar.disabled = true;
        campoNome.disabled = true;
        listaMembros.textContent = "";
        mostrarResultado("Seu perfil não tem permissão para criar projetos.", true);
        return;
    }

    try {
        const projetos = await requisitar("/projetos");
        projetosExistentes = projetos.map(function (projeto) { return normalizar(projeto.nome); });
    } catch (erro) {
        // A checagem de duplicidade é só um aviso antecipado; o servidor continua validando.
        projetosExistentes = [];
    }

    try {
        desenharMembros(await requisitar("/cadastro/usuarios"));
    } catch (erro) {
        listaMembros.textContent = "";
        erroMembros.textContent = `Não foi possível carregar a equipe: ${erro.message}`;
    }
}

carregarTela();