-- Migração one-off: adiciona campos de conteúdo real (executar uma única vez em bancos já existentes)
ALTER TABLE sites ADD COLUMN atividade_principal TEXT DEFAULT '';
ALTER TABLE sites ADD COLUMN data_abertura TEXT DEFAULT '';
ALTER TABLE sites ADD COLUMN descricao TEXT DEFAULT '';
