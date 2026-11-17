# TRAK — Sistema de Acompanhamento de Demandas

Projeto Integrador II de Engenharia de Software da PUC-Campinas. O TRAK organiza demandas de desenvolvimento, como tarefas, defeitos, melhorias e documentação, vinculadas a projetos e responsáveis.

## Equipe

- Arthur Alves Raymundi — dashboard, listagem e servidor.
- Gabriel Souza Gonçalves — login e cadastro de usuários.
- João Pedro Cayres Villela — detalhes, comentários e histórico.
- Luís Felipe Travaglini — cadastro e edição de demanda, autenticação e conexão Oracle.

Os nomes e a divisão devem ser conferidos pelo grupo antes da entrega.

## Estado do projeto

As telas e as rotas utilizam o Oracle, mas o grupo ainda precisa concluir a verificação da integração, dos vínculos e das permissões. O fluxo completo deve ser testado no banco da equipe antes da banca. Há erros de compilação TypeScript pendentes; não se deve considerar um `npm start` bem-sucedido como prova de que o `build` terminou corretamente.

O cadastro e a edição consultam a BrasilAPI para impedir prazo em feriado nacional. A disponibilidade do serviço externo é necessária quando há prazo informado.

## Como executar

### Pré-requisitos

- Node.js com suporte a `process.loadEnvFile` e npm.
- Um banco Oracle acessível, local ou fornecido pela faculdade, e acesso ao SQL Developer para preparar ou consultar as tabelas.
- Para o banco compartilhado da faculdade, conecte-se primeiro à VPN autorizada. A equipe utiliza `172.16.12.14:1521/XE`; confirme acesso e credenciais com o grupo. `localhost` refere-se ao próprio computador e não compartilha dados entre integrantes.

### Preparação

1. Clone o repositório: `git clone https://github.com/LuisTravaglini/PI_II_TIME_22.git`.
2. Entre na pasta clonada: `cd PI_II_TIME_22` e execute `npm install`.
3. Copie `.env.example` para `.env`. Configure `TRAK_DB_USER`, `TRAK_DB_PASSWORD`, `TRAK_DB_CONNECT_STRING` e `TRAK_TOKEN_SECRET` com os valores do seu ambiente. O segredo deve ser longo, aleatório e mantido privado. Nunca envie `.env` ao GitHub.
4. Em um **esquema de testes vazio**, prepare as tabelas e os dados utilizando `banco/criacao.sql`, `banco/carga_inicial.sql` e `banco/carga_demandas.sql`, nessa ordem, após revisar os scripts com a equipe. Não execute novamente a criação ou a carga em um banco existente sem verificar os dados.
5. Execute `npm run build` e depois `npm start`. Abra `http://localhost:3000/login.html`. Para desenvolvimento, use `npm run dev`.

Mantenha a VPN e o servidor ativos durante os testes. Abra as páginas pelo endereço `http://localhost:3000`, não diretamente como arquivos `file://`. Se a conexão com Oracle expirar, teste a VPN e o acesso ao banco no SQL Developer. A correção dos erros TypeScript de tipos do Node continua pendente nesta versão; se o `build` falhar, os arquivos em `dist` podem não refletir as últimas alterações.

### Dados de demonstração

Em um esquema de testes vazio, `banco/carga_inicial.sql` inclui contas fictícias de administrador, líder e membro. Essas credenciais são apenas para testes e estão no script; confirme com a equipe se a carga foi aplicada no banco compartilhado. Não execute as cargas novamente em um banco já utilizado sem verificar os dados.

Os scripts incluem a tabela de vínculo entre usuário e projeto, mas o esquema do banco escolhido precisa estar atualizado e os vínculos e permissões ainda precisam ser testados em conjunto. Sem a tabela `usuarios_projetos`, consultas que dependem dela não funcionarão. Os dados de teste devem ser conferidos no banco escolhido; não use contas de teste em produção.

## Perfis e regras previstas

O escopo prevê Administrador, Líder de Projeto e Membro da Equipe, com permissões diferentes e acesso aos projetos conforme vínculo. Essas regras ainda precisam ser verificadas em todas as rotas após a integração do grupo.

O autocadastro cria usuário com perfil `membro`. Para testar como `lider`, é necessário ajustar o perfil no banco compartilhado e vincular o usuário aos projetos relevantes; combinar previamente com a equipe. A aplicação usa os valores `administrador`, `lider` e `membro`.

As demandas seguem o ciclo Aberta → Em andamento → Em revisão → Concluída, com retorno de Em revisão para Em andamento. O cancelamento preserva a demanda e seu histórico. As regras de transição e as permissões devem ser testadas antes da entrega.

## Rotas principais

- `POST /login` e `POST /usuarios`: login e cadastro de usuários.
- `GET /usuarios`: consulta de usuários.
- `GET /dashboard`: indicadores.
- `GET /demandas` e `POST /demandas`: listagem e cadastro.
- `GET /demandas/:id` e `PUT /demandas/:id`: detalhes e edição.
- `PATCH /demandas/:id/status` e `PATCH /demandas/:id/cancelar`: status e cancelamento.
- `GET` e `POST /demandas/:id/comentarios`: comentários.
- `GET /demandas/:id/historico`: histórico.
- `GET /projetos`: projetos para o formulário.
- `POST /projetos`: criação de projeto por administrador ou líder.

As rotas protegidas utilizam `Authorization: Bearer <token>`; a integração e as regras de autorização de cada rota devem ser conferidas com o grupo.

## Tecnologias

Node.js, TypeScript, Express, Oracle (`oracledb`), HTML, CSS, JavaScript e Bootstrap. O código do backend está em `src` e é compilado para `dist`.
