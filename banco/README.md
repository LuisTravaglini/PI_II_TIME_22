# Oracle - preparação para a equipe

As tabelas podem ser criadas em um esquema Oracle vazio com `criacao.sql` e os dados fictícios com `carga_inicial.sql`. Não execute a criação novamente se as tabelas já existirem. As senhas da carga são apenas para testes locais.

Copie `.env.example` para `.env` na raiz do projeto e configure o usuário, a senha e a conexão Oracle. O arquivo `.env` não deve ser compartilhado ou versionado. O servidor carrega esse arquivo ao iniciar com `npm start` (é necessário Node.js com suporte a `process.loadEnvFile`).

O cadastro e a edição usam o Oracle. Para abrir uma demanda no formulário, acesse `/cadastro-demanda.html?id=1`, substituindo o número pelo ID desejado. A tela de detalhes, a listagem, o dashboard e o login ainda usam `dados.js` e precisam ser migrados pela equipe: os dados dessas telas não estão sincronizados com o banco.

O histórico de alterações e as permissões ainda precisam ser integrados à edição com a autenticação da equipe.
