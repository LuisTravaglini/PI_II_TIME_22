// Autor: João Pedro Cayres Villela - Autoria exclusiva deste arquivo

document.addEventListener('DOMContentLoaded', () => {
// 1. Seleção dos elementos do HTML
const campoBusca = document.getElementById('busca-demanda');
const botaoBuscar = document.getElementById('btn-buscar');
const tabelaDemandas = document.querySelector('.tabela-demandas tbody');
const containerTabela = document.querySelector('.area-dados');

// Elementos para exibir mensagens de erro/aviso
let mensagemErroBusca = document.getElementById('erro-busca');
let mensagemVazio = document.getElementById('mensagem-vazio');

// Cria os elementos de mensagem dinamicamente caso não existam no HTML
if (!mensagemErroBusca) {
mensagemErroBusca = document.createElement('p');
mensagemErroBusca.id = 'erro-busca';
mensagemErroBusca.style.color = 'red';
mensagemErroBusca.style.fontSize = '0.9rem';
mensagemErroBusca.style.marginTop = '5px';
mensagemErroBusca.style.display = 'none';
campoBusca.parentNode.appendChild(mensagemErroBusca);
    }

if (!mensagemVazio) {
mensagemVazio = document.createElement('div');
mensagemVazio.id = 'mensagem-vazio';
mensagemVazio.style.display = 'none';
mensagemVazio.style.padding = '20px';
mensagemVazio.style.textAlign = 'center';
mensagemVazio.style.fontWeight = 'bold';
mensagemVazio.innerText = 'Nenhuma demanda encontrada';
containerTabela.appendChild(mensagemVazio);
    }

// 2. Função que executa a busca (chamada tanto ao digitar quanto ao clicar no botão)
function executarBusca() {
const termoBusca = campoBusca.value;

// Validação 1: Limite máximo de 100 caracteres
if (termoBusca.length > 100) {
mensagemErroBusca.innerText = 'A busca deve ter no máximo 100 caracteres.';
mensagemErroBusca.style.display = 'block';
campoBusca.classList.add('is-invalid'); // Classe utilitária do Bootstrap/CSS
return; // Não filtra a tabela enquanto o campo estiver inválido
        } else {
mensagemErroBusca.style.display = 'none';
campoBusca.classList.remove('is-invalid');
        }

// 3. Filtragem das linhas da tabela
const linhas = tabelaDemandas.querySelectorAll('tr');
let encontrouResultado = false;

linhas.forEach(linha => {
// Pega o texto da linha em minúsculo para busca case-insensitive
const textoLinha = linha.innerText.toLowerCase();
const termoMinusculo = termoBusca.toLowerCase().trim();

if (textoLinha.includes(termoMinusculo)) {
linha.style.display = ''; // Exibe a linha
encontrouResultado = true;
            } else {
linha.style.display = 'none'; // Esconde a linha
            }
        });

// Validação 2: Exibir mensagem se nada for encontrado
if (!encontrouResultado) {
mensagemVazio.style.display = 'block';
tabelaDemandas.parentElement.style.display = 'none'; // Esconde a tabela
        } else {
mensagemVazio.style.display = 'none';
tabelaDemandas.parentElement.style.display = ''; // Mostra a tabela
        }
    }

// 4. Ouvinte de evento no campo de busca (escuta a digitação, busca em tempo real)
campoBusca.addEventListener('input', executarBusca);

// 5. Ouvinte de evento no botão de buscar (clique)
if (botaoBuscar) {
botaoBuscar.addEventListener('click', executarBusca);
    }

// 6. Permite buscar apertando Enter dentro do campo de texto
campoBusca.addEventListener('keydown', (evento) => {
if (evento.key === 'Enter') {
evento.preventDefault();
executarBusca();
        }
    });
});

// pontos importates de destacar:
// Ouvinte input: A cada letra digitada no campo #busca-demanda, a função é disparada automaticamente.
// Ouvinte click no botão: #btn-buscar agora também dispara a mesma busca ao ser clicado.
// Ouvinte keydown: Apertar Enter dentro do campo também dispara a busca.
// Validação de 100 caracteres: Verifica termoBusca.length > 100. Se ultrapassar, exibe o texto vermelho de aviso e aplica a borda/classe de erro.
// Filtro em tempo real: Percorre cada <tr> da sua tabela e verifica se o título ou descrição possui o texto digitado.
// Mensagem "Nenhuma demanda encontrada": Se nenhuma linha der correspondência com o texto buscado (encontrouResultado === false), a tabela é oculta e o texto "Nenhuma demanda encontrada" surge na tela.