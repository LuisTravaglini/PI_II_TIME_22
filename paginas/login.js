const formLogin = document.querySelector("#formLogin");

const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");
const campoLembrar = document.querySelector("#lembrar");

const erroEmail = document.querySelector("#erroEmail");
const erroSenha = document.querySelector("#erroSenha");

const mensagemLogin = document.querySelector("#mensagemLogin");

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

function mostrarMensagem(tipo, texto) {
    mensagemLogin.innerHTML = "";
    const alerta = document.createElement("div");
    alerta.className = "alert alert-" + tipo + " mt-3";
    alerta.textContent = texto;
    mensagemLogin.appendChild(alerta);
}

formLogin.addEventListener("submit", function(event) {
    event.preventDefault();
    limparErros();
    mensagemLogin.innerHTML = "";

    const email = campoEmail.value.trim();
    const senha = campoSenha.value.trim();

    let formValido = true;

    if (email === "") {
        mostrarErro(campoEmail, erroEmail, "E-mail obrigatório!");
        formValido = false;
    } else if (campoEmail.validity.typeMismatch) {
        mostrarErro(campoEmail, erroEmail, "Digite um e-mail válido!");
        formValido = false;
    }

    if (senha === "") {
        mostrarErro(campoSenha, erroSenha, "Senha obrigatória!");
        formValido = false;
    } else if (senha.length < 8) {
        mostrarErro(campoSenha, erroSenha, "A senha deve ter no mínimo 8 dígitos!");
        formValido = false;
    }

    if (formValido) {
        fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        })
        .then(function(resposta) {
            return resposta.json().then(function(dados) {
                if (resposta.ok) {
                    const usuarioTexto = JSON.stringify(dados.usuario);

                    if (campoLembrar.checked) {
                        localStorage.setItem("usuario", usuarioTexto);
                        sessionStorage.removeItem("usuario");
                    } else {
                        sessionStorage.setItem("usuario", usuarioTexto);
                        localStorage.removeItem("usuario");
                    }

                    window.location.href = "dashboard.html";
                } else {
                    mostrarMensagem("danger", dados.erro);
                }
            });
        })
        .catch(function() {
            mostrarMensagem("danger", "Não foi possível conectar ao servidor.");
        });
    }
});