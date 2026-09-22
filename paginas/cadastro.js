const formCadastro = document.querySelector("#formCadastro");

const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoSenha = document.querySelector("#senha");
const campoRepetirSenha = document.querySelector("#repetirSenha");
const campoTermos = document.querySelector("#termos");

const erroNome = document.querySelector("#erroNome");
const erroEmail = document.querySelector("#erroEmail");
const erroSenha = document.querySelector("#erroSenha");
const erroRepetirSenha = document.querySelector("#erroRepetirSenha");
const erroTermos = document.querySelector("#erroTermos");

const camposComErro = {
    campoNome,
    campoEmail,
    campoSenha,
    campoRepetirSenha,
    campoTermos
}

const mensagensDeErro = {
    erroNome,
    erroEmail,
    erroSenha,
    erroRepetirSenha,
    erroTermos
}

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    elementoErro.textContent = mensagem;
}

function limparErros() {
    const camposInvalidos = formCadastro.querySelectorAll(".is-invalid");
    camposInvalidos.forEach(campo => campo.classList.remove("is-invalid"));

    const mensagensErro = formCadastro.querySelectorAll(".invalid-feedback");
    mensagensErro.forEach(elemento => elemento.textContent = "");
}

formCadastro.addEventListener("submit", function(event) {
    event.preventDefault();
    limparErros();

    const nome = campoNome.value.trim();
    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;
    const repetirSenha = campoRepetirSenha.value;

    let formValido = true;

    if (nome === "") {
        mostrarErro(campoNome, erroNome, "O nome é obrigatório");
        formValido = false;

    } else if(nome.length < 5) {
        mostrarErro(campoNome,erroNome,"O nome deve possuir mais que 5 caracteres");
        formValido = false;
        
    } else if (nome.split(/\s+/).length < 2) {
        mostrarErro(campoNome, erroNome, "Digite nome e sobrenome");
        formValido = false;
    }

    if (email === ""){
        mostrarErro(campoEmail, erroEmail, "O email é obrigatório");
        formValido = false;

    } else if (campoEmail.validity.typeMismatch) {
        mostrarErro(campoEmail, erroEmail, "Informe um email válido!");
        formValido = false;

    } else if (!email.endsWith("@gmail.com")){
        mostrarErro(campoEmail, erroEmail, "Informe um email @gmail.com");
        formValido = false;
    }

    const possuiLetraMaiuscula = /[A-Z]/.test(senha);
    const possuiLetraMinuscula = /[a-z]/.test(senha);
    const possuiNumero = /[0-9]/.test(senha);
    const possuiEspecial = /#|@|_|!/.test(senha);
    if (senha.length < 8) {
        mostrarErro(campoSenha, erroSenha, "Senha precisa de no mínimo 8 números");
        formValido = false;
    } else if (!possuiEspecial || !possuiLetraMaiuscula || !possuiLetraMinuscula || !possuiNumero) {
        mostrarErro(campoSenha, erroSenha, "Senha não segue as exigências");
        formValido = false;
    }

    if(repetirSenha === ""){
        mostrarErro(campoRepetirSenha, erroRepetirSenha, "A confirmação da senha é obrigatória! ");
        formValido = false;
    } else if (repetirSenha !== senha){
        mostrarErro(campoRepetirSenha, erroRepetirSenha, "As senhas não coincidem");
        formValido = false;
    }

    if(!campoTermos.checked) {
        mostrarErro(campoTermos, erroTermos, "Você precisa aceitar os termos");
        formValido = false;
    }

    if (formValido) {
    alert("Cadastro realizado com sucesso!");
    formCadastro.reset();
    }

})