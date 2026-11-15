// Autor: João Pedro Cayres Villela
// Protege as telas: sem login volta para o login.html e envia o token em todas as chamadas à API.
(function () {
    const PAGINA_LOGIN = "login.html";

    // Lê o dado guardado no login (sessionStorage ou localStorage, conforme o "Lembrar de mim").
    function ler(nome) {
        for (const armazenamento of [sessionStorage, localStorage]) {
            try {
                const valor = armazenamento.getItem(nome);
                if (valor) return valor;
            } catch (erro) { /* tenta o próximo */ }
        }
        return null;
    }

    // Funções que as telas podem usar: TRAK_AUTH.usuario(), TRAK_AUTH.sair()...
    window.TRAK_AUTH = {
        token: () => ler("token"),
        usuario() { try { return JSON.parse(ler("usuario") || "null"); } catch (e) { return null; } },
        sair() {
            for (const armazenamento of [sessionStorage, localStorage]) {
                try { armazenamento.removeItem("token"); armazenamento.removeItem("usuario"); } catch (e) { /* ignora */ }
            }
            window.location.href = PAGINA_LOGIN;
        }
    };

    // Sem token guardado, a pessoa não está logada: volta para o login.
    if (!TRAK_AUTH.token()) {
        window.location.replace(PAGINA_LOGIN);
        return;
    }

    // Todo fetch para rotas do servidor ("/demandas", "/projetos"...) leva o token.
    const fetchOriginal = window.fetch.bind(window);
    window.fetch = async function (url, opcoes = {}) {
        if (typeof url === "string" && url.startsWith("/")) {
            opcoes = { ...opcoes, headers: { ...(opcoes.headers || {}), Authorization: `Bearer ${TRAK_AUTH.token()}` } };
        }
        const resposta = await fetchOriginal(url, opcoes);
        if (resposta.status === 401) TRAK_AUTH.sair(); // login expirou
        return resposta;
    };
})();