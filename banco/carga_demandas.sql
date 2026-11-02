-- Autor: Arthur Alves Raymundi - 26000661
-- Demandas de demonstração para a listagem e o dashboard.
-- Executar DEPOIS de criacao.sql e carga_inicial.sql (precisa dos projetos e usuários já cadastrados).
--
-- As datas são calculadas a partir do dia em que o script roda (TRUNC(SYSDATE) = hoje, sem hora).
-- Assim, na banca sempre existem demandas "próximas do prazo" e demandas atrasadas para mostrar.
-- Os projetos e responsáveis são achados pelo nome/e-mail, então os ids gerados pelo banco não importam.

-- 1. Aberta, crítica, SEM responsável e sem prazo
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Servidor caindo ao salvar', 'O servidor para de responder ao salvar uma demanda com descrição grande.',
    'defeito', 'critica', 'aberta',
    (SELECT id FROM projetos WHERE nome = 'Sistema TRAK'), NULL,
    SYSTIMESTAMP - 2, SYSTIMESTAMP - 2, NULL);

-- 2. Em andamento, crítica, vence em 2 dias
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Corrigir erro no cadastro', 'O formulário aceita prazo com data inválida.',
    'defeito', 'critica', 'andamento',
    (SELECT id FROM projetos WHERE nome = 'Sistema TRAK'), (SELECT id FROM usuarios WHERE email = 'membro@teste.invalid'),
    SYSTIMESTAMP - 10, SYSTIMESTAMP - 1, TRUNC(SYSDATE) + 2);

-- 3. Aberta, alta, vence em 5 dias
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Melhorar filtro da listagem', 'Permitir filtrar por mais de um campo ao mesmo tempo.',
    'melhoria', 'alta', 'aberta',
    (SELECT id FROM projetos WHERE nome = 'Sistema TRAK'), (SELECT id FROM usuarios WHERE email = 'lider@teste.invalid'),
    SYSTIMESTAMP - 6, SYSTIMESTAMP - 6, TRUNC(SYSDATE) + 5);

-- 4. Em revisão, baixa, vence hoje
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Documentar rotas da API', 'Explicar no README cada rota do backend e os erros que ela devolve.',
    'documentacao', 'baixa', 'revisao',
    (SELECT id FROM projetos WHERE nome = 'Site institucional'), (SELECT id FROM usuarios WHERE email = 'membro@teste.invalid'),
    SYSTIMESTAMP - 8, SYSTIMESTAMP - 1, TRUNC(SYSDATE));

-- 5. Concluída, alta
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Criar tela de login', 'Tela com e-mail e senha para entrar no sistema.',
    'tarefa', 'alta', 'concluida',
    (SELECT id FROM projetos WHERE nome = 'Sistema TRAK'), (SELECT id FROM usuarios WHERE email = 'admin@teste.invalid'),
    SYSTIMESTAMP - 40, SYSTIMESTAMP - 20, TRUNC(SYSDATE) - 20);

-- 6. Cancelada, baixa
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Remover tela antiga', 'Apagar a página de testes que não é mais usada.',
    'tarefa', 'baixa', 'cancelada',
    (SELECT id FROM projetos WHERE nome = 'Site institucional'), (SELECT id FROM usuarios WHERE email = 'membro@teste.invalid'),
    SYSTIMESTAMP - 35, SYSTIMESTAMP - 30, NULL);

-- 7. Em andamento, média, ATRASADA (prazo já passou)
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Ajustar layout responsivo', 'As telas quebram em celulares com menos de 400 px de largura.',
    'melhoria', 'media', 'andamento',
    (SELECT id FROM projetos WHERE nome = 'Site institucional'), (SELECT id FROM usuarios WHERE email = 'lider@teste.invalid'),
    SYSTIMESTAMP - 15, SYSTIMESTAMP - 3, TRUNC(SYSDATE) - 2);

-- 8. Aberta, média, vence em 20 dias
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Criar página de contato', 'Formulário de contato no site institucional.',
    'tarefa', 'media', 'aberta',
    (SELECT id FROM projetos WHERE nome = 'Site institucional'), (SELECT id FROM usuarios WHERE email = 'membro@teste.invalid'),
    SYSTIMESTAMP - 1, SYSTIMESTAMP - 1, TRUNC(SYSDATE) + 20);

-- 9. Em revisão, alta, vence em 6 dias
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Validar permissões por perfil', 'Conferir o que Administrador, Líder e Membro podem alterar.',
    'tarefa', 'alta', 'revisao',
    (SELECT id FROM projetos WHERE nome = 'Sistema TRAK'), (SELECT id FROM usuarios WHERE email = 'admin@teste.invalid'),
    SYSTIMESTAMP - 12, SYSTIMESTAMP - 2, TRUNC(SYSDATE) + 6);

-- 10. Concluída, média
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Manual do usuário', 'Documento explicando como cadastrar e acompanhar demandas.',
    'documentacao', 'media', 'concluida',
    (SELECT id FROM projetos WHERE nome = 'Sistema TRAK'), (SELECT id FROM usuarios WHERE email = 'lider@teste.invalid'),
    SYSTIMESTAMP - 30, SYSTIMESTAMP - 10, TRUNC(SYSDATE) - 10);

-- 11. Aberta, crítica, vence em 3 dias
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Login aceitando senha errada', 'Em alguns casos o login entra mesmo com a senha incorreta.',
    'defeito', 'critica', 'aberta',
    (SELECT id FROM projetos WHERE nome = 'Sistema TRAK'), (SELECT id FROM usuarios WHERE email = 'admin@teste.invalid'),
    SYSTIMESTAMP - 3, SYSTIMESTAMP - 3, TRUNC(SYSDATE) + 3);

-- 12. Aberta, baixa, sem prazo
INSERT INTO demandas (titulo, descricao, tipo, prioridade, status, projeto_id, responsavel_id, data_criacao, data_atualizacao, prazo)
VALUES ('Trocar ícones do menu', 'Usar os ícones novos da identidade visual do TRAK.',
    'melhoria', 'baixa', 'aberta',
    (SELECT id FROM projetos WHERE nome = 'Site institucional'), NULL,
    SYSTIMESTAMP - 4, SYSTIMESTAMP - 4, NULL);

COMMIT;
