function obterUsuario(){
    let texto = sessionStorage.getItem("usuario");

    if(texto === null){
        texto = localStorage.getItem("usuario");
    }

    let usuario = null;

    if(texto != null){
        usuario = JSON.parse(texto);
    }

    return usuario;
}

function exigirLogin(){
    if(obterUsuario() === null){
        window.location.href = "login.html";
    }
}

function sair(){
    sessionStorage.removeItem("usuario");
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

exigirLogin();

const linkSair = document.querySelector("#linkSair");

if(linkSair != null){
    linkSair.addEventListener("click", function(event){
        event.preventDefault();
        sair();
    });
}