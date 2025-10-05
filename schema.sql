-- Tabela para armazenar os dados dos usuários do sistema
CREATE TABLE Usuario (
    ID_Usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Senha_Criptografada TEXT NOT NULL,
    Perfil TEXT CHECK(Perfil IN ('Socorrista', 'Farmacia', 'Gestor')) NOT NULL,
    Matricula_Empresa TEXT UNIQUE,
    CPF TEXT UNIQUE,
    Data_Cadastro TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as informações das ambulâncias
CREATE TABLE Ambulancia (
    ID_Ambulancia INTEGER PRIMARY KEY AUTOINCREMENT,
    Placa TEXT NOT NULL UNIQUE,
    Tipo_Ambulancia TEXT, -- Ex: 'USB - Unidade de Suporte Básico', 'USA - Unidade de Suporte Avançado'
    Status_Operacional TEXT DEFAULT 'Apto', -- Ex: 'Apto', 'Inapto'
    Data_Cadastro TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para cadastrar todos os tipos de insumos médicos
CREATE TABLE Insumo (
    ID_Insumo INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome_Insumo TEXT NOT NULL,
    Descricao TEXT,
    Unidade_Medida TEXT, -- Ex: 'Unidade', 'Caixa', 'Frasco'
    Quantidade_Minima INTEGER,
    Critico INTEGER DEFAULT 0, -- Em SQLite, usa-se 0 para False e 1 para True
    Categoria TEXT,
    Data_Cadastro TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para registrar cada checklist realizado
CREATE TABLE Checklist_Diario (
    ID_Checklist INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Ambulancia INTEGER,
    ID_Socorrista INTEGER,
    Data_Hora_Preenchimento TEXT DEFAULT CURRENT_TIMESTAMP,
    Turno TEXT, -- Ex: 'Manhã', 'Tarde', 'Noite'
    Status_Final_Ambulancia TEXT, -- Status definido pelo socorrista após o checklist
    Observacoes_Gerais TEXT,
    FOREIGN KEY (ID_Ambulancia) REFERENCES Ambulancia(ID_Ambilancia),
    FOREIGN KEY (ID_Socorrista) REFERENCES Usuario(ID_Usuario)
);

-- Tabela para registrar os itens verificados em cada checklist
CREATE TABLE Itens_Checklist (
    ID_Itens_Checklist INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Checklist INTEGER,
    ID_Insumo INTEGER,
    Status_Item TEXT, -- Ex: 'Presente', 'Ausente', 'Vencido'
    Observacoes_Item TEXT,
    FOREIGN KEY (ID_Checklist) REFERENCES Checklist_Diario(ID_Checklist),
    FOREIGN KEY (ID_Insumo) REFERENCES Insumo(ID_Insumo)
);

-- Tabela para registrar os pedidos de reposição
CREATE TABLE Pedido_Reposicao (
    ID_Pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Checklist INTEGER, -- Vincula o pedido ao checklist que o originou
    ID_Socorrista_Solicitante INTEGER,
    ID_Farmacia_Responsavel INTEGER,
    Data_Hora_Solicitacao TEXT DEFAULT CURRENT_TIMESTAMP,
    Data_Hora_Entrega TEXT,
    Status_Pedido TEXT DEFAULT 'Pendente', -- Ex: 'Pendente', 'Atendido', 'Cancelado'
    FOREIGN KEY (ID_Checklist) REFERENCES Checklist_Diario(ID_Checklist),
    FOREIGN KEY (ID_Socorrista_Solicitante) REFERENCES Usuario(ID_Usuario),
    FOREIGN KEY (ID_Farmacia_Responsavel) REFERENCES Usuario(ID_Usuario)
);

-- Tabela para detalhar os itens de cada pedido de reposição
CREATE TABLE Itens_Pedido (
    ID_Itens_Pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    ID_Pedido INTEGER,
    ID_Insumo INTEGER,
    Quantidade_Solicitada INTEGER NOT NULL,
    Quantidade_Entregue INTEGER,
    FOREIGN KEY (ID_Pedido) REFERENCES Pedido_Reposicao(ID_Pedido),
    FOREIGN KEY (ID_Insumo) REFERENCES Insumo(ID_Insumo)
);