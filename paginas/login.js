//Feito por: Gabriel Souza Gonçalves

const formLogin = document.querySelector("#formLogin");

const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");
const campoLembrar = document.querySelector("#lembrar")

const erroEmail = document.querySelector("#erroEmail");
const erroSenha = document.querySelector("#erroSenha");
const erroLembrar = document.querySelector("#lembrar");

const mensagemLogin = document.querySelector("#mensagemLogin");

const camposComErro = {
    campoEmail,
    campoSenha
}

const mensagensDeErro = {
    erroEmail,
    erroSenha
}

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.textContent = mensagem;
}

function limparErros() {
    const camposInvalidos = formLogin.querySelectorAll(".is-invalid");
    camposInvalidos.forEach(campo => campo.classList.remove("is-invalid"));

    const mensagensErro = formLogin.querySelectorAll(".invalid-feedback");
    mensagensErro.forEach(elemento => elemento.textContent = "");
}

function mostrarMensagem(texto, tipo) {
    mensagemLogin.innerHTML = "";
    const aviso = document.createElement("div");
    aviso.className = `alert alert-${tipo} mt-3`;
    aviso.textContent = texto;
    mensagemLogin.appendChild(aviso);
}

formLogin.addEventListener( async function(event) {
    event.preventDefault();
    limparErros();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value;

    let formValido = true;

    if (email === "") {
        mostrarErro(campoEmail, erroEmail, "E-mail obrigatório!");
        formValido = false;
    } else if (campoEmail.validity.typeMismatch) {
        mostrarErro(campoEmail, erroEmail, "Digite um e-mail válido!");
        formValido = false;
    }

    if(senha === ""){
        mostrarErro(campoSenha, erroSenha, "Senha obrigatória!");
        formValido = false;
    } else if (senha.length < 8){
        mostrarErro(campoSenha, erroSenha, "A senha deve ter no mínimo 8 dígitos!");
        formValido = false;
    }

    if (formValido) {
    try {
        const resposta = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });
        const dados = await resposta.json().catch(() => ({}));
        if (!resposta.ok) {
            mostrarMensagem(dados.erro || "Não foi possível entrar.", "danger");
            return;
        }
        sessionStorage.clear();
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        const armazenamento = campoLembrar.checked ? localStorage : sessionStorage;
        armazenamento.setItem("token", dados.token);
        armazenamento.setItem("usuario", JSON.stringify(dados.usuario));
        window.location.href = "dashboard.html";
    } catch (erro) {
        mostrarMensagem("Não foi possível conectar ao servidor.", "danger");
    }
}
4.  

});