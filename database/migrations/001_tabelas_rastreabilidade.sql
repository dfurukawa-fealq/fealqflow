
    -- Tabela de Histórico de Migrações
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Sessões de Preenchimento (Rastreabilidade Master)
    CREATE TABLE IF NOT EXISTS sessoes (
        session_id VARCHAR(64) PRIMARY KEY,
        protocol_id VARCHAR(32) NOT NULL,
        form_origem VARCHAR(100) NOT NULL,
        titulo TEXT,
        responsavel_nome VARCHAR(255),
        responsavel_email VARCHAR(255),
        status VARCHAR(30) DEFAULT 'em_preenchimento',
        dados_json TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Rastreabilidade entre Formulários (Links e Relações Pai-Filho)
    CREATE TABLE IF NOT EXISTS rastreabilidade_formularios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id VARCHAR(64) NOT NULL,
        protocol_id VARCHAR(32) NOT NULL,
        form_codigo VARCHAR(50) NOT NULL,
        form_nome VARCHAR(255) NOT NULL,
        url_origem TEXT,
        url_destino TEXT,
        status VARCHAR(30) DEFAULT 'pendente',
        dados_vinculados TEXT,
        preenchido_em TIMESTAMP,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Configuração e Normas de Formulários
    CREATE TABLE IF NOT EXISTS config_formularios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        formulario VARCHAR(255) UNIQUE NOT NULL,
        normas TEXT,
        documentos_solicitados TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Tabela de Calendário de Submissão e Linhas de Incentivo
    CREATE TABLE IF NOT EXISTS calendario_submissao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_form INTEGER UNIQUE NOT NULL,
        formulario VARCHAR(255) NOT NULL,
        linha_de_incentivo VARCHAR(255),
        status_de_abertura VARCHAR(50),
        periodos_de_submissao TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    