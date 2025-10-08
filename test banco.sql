-- Seleciona o nosso banco de dados
USE emlog_db;

-- Insere alguns insumos de exemplo
INSERT INTO Insumo (Nome_Insumo, Unidade_Medida, Quantidade_Minima, Critico) VALUES 
('Gaze 15x30 cm', 'Unidade', 10, TRUE),
('Luva tamanho G', 'Caixa', 1, TRUE),
('Adrenalina 1mg', 'Unidade', 2, TRUE),
('Morfina 1mg', 'Unidade', 3, TRUE),
('Agulha 30x8 mm', 'Unidade', 5, FALSE);

-- Cadastra uma ambulância de exemplo. O MySQL vai dar a ela o ID = 1 automaticamente.
INSERT INTO Ambulancia (Placa, Tipo_Ambulancia) VALUES ('ABC-1234', 'USB - Unidade de Suporte Básico');
