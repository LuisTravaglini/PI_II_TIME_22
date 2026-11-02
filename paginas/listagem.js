// Autores: João Pedro Cayres Villela (validações da busca, Reunião 3)
//          e Arthur Alves Raymundi - 26000661 (integração com a API GET /demandas, Reunião 5)
// Tela: Listagem de demandas.
// Monta a tabela com as demandas do banco, aplicando filtros, busca e ordenação pela API.

document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleção dos elementos do HTML
    const campoBusca = document.getElementById('busca-demanda');
    const botaoBuscar = document.getElementById('btn-buscar');
    const filtroStatus = document.getElementById('filtro-status');
    const filtroPrioridade = document.getElementById('filtro-prioridade');
    const ordenacao = document.getElementById('ordenacao');
    const tabelaDemandas = document.querySelector('.tabela-demandas tbody');
    const containerTabela = document.querySelector('.area-dados');
    const mensagemErroApi = document.getElementById('erro-api');

    // Nome bonito de cada valor que vem da API (no banco tudo fica sem acento e em minúsculo).
    const NOMES = {
        tipo: { tarefa: 'Tarefa', defeito: 'Defeito', melhoria: 'Melhoria', documentacao: 'Documentação' },
        prioridade: { critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa' },
        status: {
            aberta: 'Aberta', andamento: 'Em andamento', revisao: 'Em revisão',
            concluida: 'Concluída', cancelada: 'Cancelada'
        }
    };

    // Mensagem de erro da busca, logo abaixo do campo (validação da Reunião 3)
    const mensagemErroBusca = document.createElement('p');
    mensagemErroBusca.id = 'erro-busca';
    mensagemErroBusca.style.color = 'red';
    mensagemErroBusca.style.fontSize = '0.9rem';
    mensagemErroBusca.style.marginTop = '5px';
    mensagemErroBusca.style.display = 'none';
    campoBusca.parentNode.appendChild(mensagemErroBusca);

    // Mensagem "Nenhuma demanda encontrada", mostrada no lugar da tabela
    const mensagemVazio = document.createElement('div');
    mensagemVazio.id = 'mensagem-vazio';
    mensagemVazio.style.display = 'none';
    mensagemVazio.style.padding = '20px';
    mensagemVazio.style.textAlign = 'center';
    mensagemVazio.style.fontWeight = 'bold';
    mensagemVazio.innerText = 'Nenhuma demanda encontrada';
    containerTabela.appendChild(mensagemVazio);

    // Converte "2026-11-05" em "05/11/2026". Sem data, mostra um traço.
    function formatarData(data) {
        if (!data) {
            return '—';
        }
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // Cria uma célula com texto. Usar textContent (e não innerHTML) impede que um título
    // digitado com HTML seja executado na página.
    function criarCelula(texto) {
        const celula = document.createElement('td');
        celula.textContent = texto;
        return celula;
    }

    // 2. Validação da busca: limite máximo de 100 caracteres
    function buscaValida() {
        if (campoBusca.value.length > 100) {
            mensagemErroBusca.innerText = 'A busca deve ter no máximo 100 caracteres.';
            mensagemErroBusca.style.display = 'block';
            campoBusca.classList.add('is-invalid');
            return false;
        }

        mensagemErroBusca.style.display = 'none';
        campoBusca.classList.remove('is-invalid');
        return true;
    }

    // 3. Monta a URL da API só com os filtros preenchidos.
    // Ex.: /demandas?status=aberta&ordenarPor=prazo
    function montarParametros() {
        const parametros = new URLSearchParams();

        if (campoBusca.value.trim()) parametros.set('busca', campoBusca.value.trim());
        if (filtroStatus.value) parametros.set('status', filtroStatus.value);
        if (filtroPrioridade.value) parametros.set('prioridade', filtroPrioridade.value);
        if (ordenacao.value) parametros.set('ordenarPor', ordenacao.value);

        return parametros;
    }

    // 4. Desenha as linhas da tabela com a lista que veio da API
    function mostrarDemandas(demandas) {
        tabelaDemandas.innerHTML = '';

        if (demandas.length === 0) {
            mensagemVazio.style.display = 'block';
            tabelaDemandas.parentElement.style.display = 'none';
            return;
        }

        mensagemVazio.style.display = 'none';
        tabelaDemandas.parentElement.style.display = '';

        for (const demanda of demandas) {
            const linha = document.createElement('tr');

            linha.appendChild(criarCelula(demanda.titulo));
            linha.appendChild(criarCelula(NOMES.tipo[demanda.tipo] || demanda.tipo));
            linha.appendChild(criarCelula(NOMES.prioridade[demanda.prioridade] || demanda.prioridade));
            linha.appendChild(criarCelula(NOMES.status[demanda.status] || demanda.status));
            linha.appendChild(criarCelula(demanda.projeto));
            linha.appendChild(criarCelula(demanda.responsavel || 'Não atribuído'));
            linha.appendChild(criarCelula(formatarData(demanda.dataCriacao)));
            linha.appendChild(criarCelula(formatarData(demanda.prazo)));

            // Botão que abre a tela de detalhes passando o id na URL: detalhes-demanda.html?id=3
            const celulaAcoes = document.createElement('td');
            const linkDetalhes = document.createElement('a');
            linkDetalhes.href = `detalhes-demanda.html?id=${demanda.id}`;
            linkDetalhes.className = 'btn-detalhes';
            linkDetalhes.textContent = 'Ver Detalhes';
            celulaAcoes.appendChild(linkDetalhes);
            linha.appendChild(celulaAcoes);

            tabelaDemandas.appendChild(linha);
        }
    }

    // 5. Busca as demandas na API com os filtros atuais
    async function carregarDemandas() {
        if (!buscaValida()) {
            return; // Não consulta a API enquanto o campo estiver inválido
        }

        const parametros = montarParametros();
        mensagemErroApi.innerText = '';

        // Guarda os filtros na barra de endereço: ao recarregar a página (F5), eles continuam.
        history.replaceState(null, '', parametros.size ? `?${parametros}` : location.pathname);

        let resposta;
        try {
            resposta = await fetch(`/demandas?${parametros}`);
        } catch (erro) {
            console.error(erro);
            mensagemErroApi.innerText = 'Não foi possível conectar ao servidor. Verifique se ele está rodando.';
            return;
        }

        const dados = await resposta.json().catch(() => ({}));

        // Erro da API (400 filtro inválido, 503 banco fora do ar...): mostra a mensagem dela na tela
        if (!resposta.ok) {
            mensagemErroApi.innerText = dados.erro || `Erro ${resposta.status} ao carregar as demandas.`;
            mostrarDemandas([]);
            return;
        }

        mostrarDemandas(dados);
    }

    // 6. Preenche os campos com os filtros que já estiverem na URL da página
    // (ex.: listagem_demanda.html?status=aberta vinda de outro link)
    const filtrosDaPagina = new URLSearchParams(location.search);
    campoBusca.value = filtrosDaPagina.get('busca') || '';
    filtroStatus.value = filtrosDaPagina.get('status') || '';
    filtroPrioridade.value = filtrosDaPagina.get('prioridade') || '';
    ordenacao.value = filtrosDaPagina.get('ordenarPor') || '';

    // 7. Ouvintes de evento
    // Busca: espera o usuário parar de digitar por 400 ms antes de consultar a API,
    // para não fazer uma requisição a cada letra.
    let esperaDigitacao;
    campoBusca.addEventListener('input', () => {
        clearTimeout(esperaDigitacao);
        esperaDigitacao = setTimeout(carregarDemandas, 400);
    });

    botaoBuscar.addEventListener('click', carregarDemandas);

    // Enter dentro do campo também dispara a busca
    campoBusca.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            evento.preventDefault();
            clearTimeout(esperaDigitacao);
            carregarDemandas();
        }
    });

    // Filtros e ordenação consultam a API assim que mudam
    filtroStatus.addEventListener('change', carregarDemandas);
    filtroPrioridade.addEventListener('change', carregarDemandas);
    ordenacao.addEventListener('change', carregarDemandas);

    // 8. Primeira carga ao abrir a página
    carregarDemandas();
});
