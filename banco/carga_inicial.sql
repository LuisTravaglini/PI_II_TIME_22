-- Dados fictícios para demonstração local. Executar apenas em um banco vazio de testes.
-- As senhas são exclusivamente de teste e devem ser substituídas antes de qualquer uso real.
INSERT INTO projetos (nome) VALUES ('Sistema TRAK');
INSERT INTO projetos (nome) VALUES ('Site institucional');

INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Administrador de teste', 'admin@teste.invalid', '123456', 'administrador');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Líder de teste', 'lider@teste.invalid', '123456', 'lider');
INSERT INTO usuarios (nome, email, senha, perfil) VALUES ('Membro de teste', 'membro@teste.invalid', '123456', 'membro');
COMMIT;
