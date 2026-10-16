// Autor: Arthur
// Dados de teste usados por TODAS as rotas, até o banco de dados ficar pronto.
// Ficam na memória: se o servidor reiniciar, o que foi cadastrado some.

 
export const usuarios = [
    { id: 1, nome: "Arthur", email: "arthur@trak.com", senha: "123456", perfil: "gestor" },
    { id: 2, nome: "Gabriel", email: "gabriel@trak.com", senha: "123456", perfil: "desenvolvedor" },
    { id: 3, nome: "João Pedro", email: "joao@trak.com", senha: "123456", perfil: "desenvolvedor" },
    { id: 4, nome: "Kaiky", email: "kaiky@trak.com", senha: "123456", perfil: "desenvolvedor" },
    { id: 5, nome: "Luís", email: "luis@trak.com", senha: "123456", perfil: "desenvolvedor" }
];
 
export const projetos = [
    { id: 1, nome: "Sistema TRAK" },
    { id: 2, nome: "Site institucional" }
];
 
export const demandas = [
    {
        id: 1, titulo: "Criar tela de login", descricao: "Tela com e-mail e senha para entrar no sistema.",
        tipo: "tarefa", prioridade: "alta", status: "concluida", projetoId: 1, responsavelId: 1,
        dataCriacao: "2026-09-01", dataAtualizacao: "2026-10-10", prazo: "2026-10-10"
    },
    {
        id: 2, titulo: "Corrigir erro no cadastro", descricao: "O formulário aceita prazo com data inválida.",
        tipo: "defeito", prioridade: "critica", status: "andamento", projetoId: 1, responsavelId: 5,
        dataCriacao: "2026-10-05", dataAtualizacao: "2026-10-14", prazo: "2026-10-18"
    },
    {
        id: 3, titulo: "Melhorar filtro da listagem", descricao: "Permitir filtrar por mais de um campo ao mesmo tempo.",
        tipo: "melhoria", prioridade: "media", status: "aberta", projetoId: 1, responsavelId: 3,
        dataCriacao: "2026-10-08", dataAtualizacao: "2026-10-08", prazo: "2026-10-20"
    },
    {
        id: 4, titulo: "Documentar rotas da API", descricao: "Explicar no README cada rota do backend.",
        tipo: "documentacao", prioridade: "baixa", status: "revisao", projetoId: 2, responsavelId: 2,
        dataCriacao: "2026-10-09", dataAtualizacao: "2026-10-15", prazo: "2026-10-30"
    },
    {
        id: 5, titulo: "Servidor caindo ao salvar", descricao: "O servidor para de responder ao salvar uma demanda.",
        tipo: "defeito", prioridade: "critica", status: "aberta", projetoId: 1, responsavelId: null,
        dataCriacao: "2026-10-15", dataAtualizacao: "2026-10-15", prazo: ""
    },
    {
        id: 6, titulo: "Remover tela antiga", descricao: "Apagar a página de testes que não é mais usada.",
        tipo: "tarefa", prioridade: "baixa", status: "cancelada", projetoId: 2, responsavelId: 4,
        dataCriacao: "2026-09-20", dataAtualizacao: "2026-09-25", prazo: ""
    }
];
 

export const comentarios = [
    { id: 1, demandaId: 2, usuarioId: 1, texto: "Consegue terminar até sexta?", dataHora: "2026-10-14T10:30:00.000Z" },
    { id: 2, demandaId: 2, usuarioId: 5, texto: "Sim, já achei a causa.", dataHora: "2026-10-14T11:05:00.000Z" }
];