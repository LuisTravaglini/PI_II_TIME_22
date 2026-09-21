// Autor: João PEdro Cayres Villela - Autoria exclusiva deste arquivo

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleção dos elementos do HTML
    const formComentario = document.querySelector('form') || document.querySelector('.area-comentarios');
    const campoComentario = document.getElementById('comentario') || document.querySelector('textarea');
    
    // Procura ou cria a div de feedback de erro (.invalid-feedback)
    let feedbackErro = campoComentario ? campoComentario.nextElementSibling : null;
    
    if (campoComentario && (!feedbackErro || !feedbackErro.classList.contains('invalid-feedback'))) {
        feedbackErro = document.createElement('div');
        feedbackErro.className = 'invalid-feedback';
        campoComentario.parentNode.insertBefore(feedbackErro, campoComentario.nextSibling);
    }

    // Função de validação do comentário
    function validarComentario() {
        const texto = campoComentario.value.trim();

        // Validação: Comentário obrigatório e mínimo de 5 caracteres
        if (texto.length === 0) {
            exibirErro('O comentário é obrigatório e não pode estar vazio.');
            return false;
        } else if (texto.length < 5) {
            exibirErro('O comentário deve ter no mínimo 5 caracteres.');
            return false;
        } else if (texto.length > 500) {
            // Validação: Máximo de 500 caracteres
            exibirErro('O comentário deve ter no máximo 500 caracteres.');
            return false;
        } else {
            limparErro();
            return true;
        }
    }

    // Exibe a mensagem de erro e aplica a classe is-invalid
    function exibirErro(mensagem) {
        campoComentario.classList.add('is-invalid');
        feedbackErro.innerText = mensagem;
        feedbackErro.style.display = 'block';
    }

    // Remove as marcações de erro se o campo for válido
    function limparErro() {
        campoComentario.classList.remove('is-invalid');
        feedbackErro.innerText = '';
        feedbackErro.style.display = 'none';
    }

    // 2. Ouvinte de evento ao digitar (para atualizar em tempo real)
    if (campoComentario) {
        campoComentario.addEventListener('input', () => {
            if (campoComentario.classList.contains('is-invalid')) {
                validarComentario();
            }
        });
    }

    // 3. Ouvinte de evento ao submeter/enviar o comentário
    if (formComentario) {
        formComentario.addEventListener('submit', (event) => {
            // Impede o envio do formulário se o comentário for inválido
            if (!validarComentario()) {
                event.preventDefault();
            } else {
                // Lógica de sucesso (ex: adicionar o comentário na tela ou enviar)
                event.preventDefault(); // Evita recarregar a página nos testes visuais
                alert('Comentario enviado com sucesso!');
                campoComentario.value = '';
                limparErro();
            }
        });
    }
});


// detalhes importantes:
// Aplica Bootstrap/CSS: Adiciona a classe is-invalid ao <textarea> e mostra o texto dentro de .invalid-feedback.
// Impede envio inválido: Utiliza event.preventDefault() se qualquer uma das regras de validação falhar.