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

formLogin.addEventListener("submit", function(event) {
    event.preventDefault();
    limparErros();

    const email = campoEmail.value.trim();
    const senha = campoSenha.value.trim().toLowerCase();

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

    if(formValido){
        mensagemLogin.innerHTML = `
            <div class="alert alert-success mt-3>
                Login realizado com sucesso!
            </div>
            `;
    }

});