# TRAK — Sistema de Acompanhamento de Demandas

Projeto Integrador II de Engenharia de Software da PUC-Campinas. O TRAK organiza demandas de desenvolvimento, como tarefas, defeitos, melhorias e documentação, vinculadas a projetos e responsáveis.

## Equipe

- Arthur Alves Raymundi — dashboard, listagem e servidor.
- Gabriel Souza Gonçalves — login e cadastro de usuários.
- João Pedro Cayres Villela — detalhes, comentários e histórico.
- Luís Felipe Travaglini — cadastro e edição de demanda, autenticação e conexão Oracle.

Os nomes e a divisão devem ser conferidos pelo grupo antes da entrega.

## Estado do projeto

As telas, as rotas e a integração com o Oracle estão em desenvolvimento. O grupo ainda precisa integrar as alterações pendentes dos integrantes, confirmar o vínculo entre usuários e projetos e testar todas as permissões e o sistema completo antes da banca.

O cadastro e a edição consultam a BrasilAPI para impedir prazo em feriado nacional. A disponibilidade do serviço externo é necessária quando há prazo informado.

## Como executar

### Pré-requisitos

- Node.js com suporte a `process.loadEnvFile` e npm.
- Um banco Oracle acessível, local ou fornecido pela faculdade, e acesso ao SQL Developer para preparar as tabelas.
- Se o banco da faculdade exigir VPN, configurá-la antes de conectar. O endereço, a porta e o serviço precisam ser confirmados pela instituição.

### Preparação

1. Clone o repositório: `git clone https://github.com/LuisTravaglini/PI_II_TIME_22.git`.
2. Entre na pasta clonada: `cd PI_II_TIME_22` e execute `npm install`.
3. Copie `.env.example` para `.env`. Configure `TRAK_DB_USER`, `TRAK_DB_PASSWORD`, `TRAK_DB_CONNECT_STRING` e `TRAK_TOKEN_SECRET` com os valores do seu ambiente. O segredo deve ser longo, aleatório e mantido privado. Nunca envie `.env` ao GitHub.
4. Em um **esquema de testes vazio**, prepare as tabelas e os dados utilizando `banco/criacao.sql`, `banco/carga_inicial.sql` e `banco/carga_demandas.sql`, nessa ordem, após revisar os scripts com a equipe. Não execute novamente a criação ou a carga em um banco existente sem verificar os dados.
5. Execute `npm start` e abra `http://localhost:3000/login.html`.

Os scripts de vínculo entre usuário e projeto e as permissões ainda precisam ser integrados e testados. Sem a tabela `usuarios_projetos`, consultas que dependem dela não funcionarão. Os dados de teste devem ser conferidos no banco escolhido; não use contas de teste em produção.

## Perfis e regras previstas

O escopo prevê Administrador, Líder de Projeto e Membro da Equipe, com permissões diferentes e acesso aos projetos conforme vínculo. Essas regras ainda precisam ser verificadas em todas as rotas após a integração do grupo.

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

As rotas protegidas utilizam `Authorization: Bearer <token>`; a integração e as regras de autorização de cada rota devem ser conferidas com o grupo.

## Tecnologias

Node.js, Express, Oracle (`oracledb`), HTML, CSS, JavaScript e Bootstrap. A migração do backend para TypeScript está pendente de coordenação com as alterações dos integrantes.
