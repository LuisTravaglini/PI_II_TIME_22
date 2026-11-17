# Oracle - preparação para a equipe

As tabelas podem ser criadas em um esquema Oracle vazio com `criacao.sql` e os dados fictícios com `carga_inicial.sql`. Não execute a criação novamente se as tabelas já existirem. As senhas da carga são apenas para testes locais.

Copie `.env.example` para `.env` na raiz do projeto e configure o usuário, a senha e a conexão Oracle. O arquivo `.env` não deve ser compartilhado ou versionado. O servidor carrega esse arquivo ao iniciar com `npm start` (é necessário Node.js com suporte a `process.loadEnvFile`).

As rotas de cadastro e edição, login, detalhes, listagem e dashboard foram implementadas para consultar o Oracle. A integração completa e as permissões ainda devem ser verificadas com o banco usado pela equipe. Para editar uma demanda existente, acesse `/cadastro-demanda.html?id=1`, substituindo o número pelo ID desejado e respeitando as permissões do usuário.

O histórico e as permissões têm implementação no projeto, mas precisam de teste ponta a ponta após a integração. Não execute scripts de criação ou carga novamente no banco compartilhado sem avaliar o estado existente. A carga inicial não garante, por si só, que líderes e membros estejam vinculados aos projetos.
