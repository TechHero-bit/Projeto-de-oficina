-- Script para recriar as tabelas do banco de dados PostgreSQL
-- Projeto Oficina Mecânica

-- Remover as tabelas caso já existam (ordem inversa de dependência)
DROP TABLE IF EXISTS itens_servico;
DROP TABLE IF EXISTS ordens_servico;
DROP TABLE IF EXISTS veiculos;
DROP TABLE IF EXISTS clientes;

-- Tabela de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Veículos
CREATE TABLE veiculos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    ano INTEGER,
    placa VARCHAR(10) UNIQUE NOT NULL,
    cor VARCHAR(30),
    quilometragem INTEGER,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ordens de Serviço
CREATE TABLE ordens_servico (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    veiculo_id INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE RESTRICT,
    descricao_problema TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Aberto',
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP,
    observacoes TEXT,
    valor_total DECIMAL(10, 2) DEFAULT 0.00
);

-- Tabela de Itens de Serviço
CREATE TABLE itens_servico (
    id SERIAL PRIMARY KEY,
    ordem_servico_id INTEGER NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL
);
