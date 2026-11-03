#!/usr/bin/env python3
"""
FealqFlow Database Migration Script
Suporta SQLite (padrão local) e PostgreSQL (via DATABASE_URL)
Executa na sequência:
  1. Valida se o banco existe (ou cria a estrutura básica)
  2. Executa as migrations:
     a. Criação de Tabelas (sessoes, rastreabilidade_formularios, calendario_submissao, config_formularios)
     b. Mapeamento de Calendário (mapeamento_calendario_de_submissao.json -> SQL)
     c. Mapeamento de Formulários (mapeamento_formularios.json -> SQL)
"""

import os
import sys
import json
import sqlite3
from datetime import datetime

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DATA_DIR = os.path.join(ROOT_DIR, 'data')
DB_DIR = os.path.join(ROOT_DIR, 'database')
SQLITE_DB_PATH = os.path.join(DB_DIR, 'fealqflow.db')
MIGRATIONS_DIR = os.path.join(DB_DIR, 'migrations')

def ensure_directories():
    os.makedirs(DB_DIR, exist_ok=True)
    os.makedirs(MIGRATIONS_DIR, exist_ok=True)

def get_connection():
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres'):
        try:
            import psycopg2
            print(f"[DB] Conectando ao PostgreSQL via DATABASE_URL...")
            conn = psycopg2.connect(database_url)
            return conn, 'postgres'
        except ImportError:
            print("[AVISO] Driver psycopg2 não encontrado. Utilizando SQLite como fallback.")
    
    print(f"[DB] Utilizando banco SQLite em: {SQLITE_DB_PATH}")
    banco_ja_existia = os.path.exists(SQLITE_DB_PATH)
    if banco_ja_existia:
        print("[DB] 1. Validação de Banco: Banco de dados SQLite existente encontrado.")
    else:
        print("[DB] 1. Validação de Banco: Criando novo arquivo de banco SQLite...")
    
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, 'sqlite', banco_ja_existia

def run_step_1_create_tables(conn, db_type):
    print("\n[MIGRATION 2.a] Criando/Verificando Tabelas do Sistema...")
    cursor = conn.cursor()

    sql_schema = """
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
    """

    if db_type == 'postgres':
        # Adapt auto-increment syntax for postgres
        sql_schema = sql_schema.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")

    # Executa os statements
    for statement in sql_schema.split(';'):
        stmt = statement.strip()
        if stmt:
            cursor.execute(stmt)

    conn.commit()

    # Salva arquivo SQL exportável
    with open(os.path.join(MIGRATIONS_DIR, '001_tabelas_rastreabilidade.sql'), 'w', encoding='utf-8') as f:
        f.write(sql_schema)

    print(" ✓ Tabelas criadas com sucesso (sessoes, rastreabilidade_formularios, config_formularios, calendario_submissao)")

def run_step_2_seed_calendario(conn, db_type):
    print("\n[MIGRATION 2.b] Convertendo mapeamento_calendario_de_submissao.json em SQL...")
    json_path = os.path.join(DATA_DIR, 'mapeamento_calendario_de_submissao.json')
    if not os.path.exists(json_path):
        print(f" [ERRO] Arquivo não encontrado: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    cursor = conn.cursor()
    sql_statements = []

    for item in items:
        id_form = item.get('IdForm')
        formulario = item.get('formulario')
        linha = item.get('linha_de_incentivo')
        status = item.get('status_de_abertura')
        periodos_json = json.dumps(item.get('periodos_de_submissao', []), ensure_ascii=False)

        if db_type == 'sqlite':
            cursor.execute("""
                INSERT INTO calendario_submissao (id_form, formulario, linha_de_incentivo, status_de_abertura, periodos_de_submissao, atualizado_em)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(id_form) DO UPDATE SET
                    formulario=excluded.formulario,
                    linha_de_incentivo=excluded.linha_de_incentivo,
                    status_de_abertura=excluded.status_de_abertura,
                    periodos_de_submissao=excluded.periodos_de_submissao,
                    atualizado_em=CURRENT_TIMESTAMP
            """, (id_form, formulario, linha, status, periodos_json))
        else:
            cursor.execute("""
                INSERT INTO calendario_submissao (id_form, formulario, linha_de_incentivo, status_de_abertura, periodos_de_submissao, atualizado_em)
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT(id_form) DO UPDATE SET
                    formulario=EXCLUDED.formulario,
                    linha_de_incentivo=EXCLUDED.linha_de_incentivo,
                    status_de_abertura=EXCLUDED.status_de_abertura,
                    periodos_de_submissao=EXCLUDED.periodos_de_submissao,
                    atualizado_em=CURRENT_TIMESTAMP
            """, (id_form, formulario, linha, status, periodos_json))

        periodos_escaped = periodos_json.replace("'", "''")
        formulario_escaped = formulario.replace("'", "''")
        linha_escaped = linha.replace("'", "''")
        sql_statements.append(
            f"INSERT INTO calendario_submissao (id_form, formulario, linha_de_incentivo, status_de_abertura, periodos_de_submissao) "
            f"VALUES ({id_form}, '{formulario_escaped}', '{linha_escaped}', '{status}', '{periodos_escaped}') "
            f"ON CONFLICT(id_form) DO UPDATE SET status_de_abertura='{status}', periodos_de_submissao='{periodos_escaped}';"
        )

    conn.commit()

    # Salva arquivo SQL exportável
    with open(os.path.join(MIGRATIONS_DIR, '002_seed_calendario.sql'), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))

    print(f" ✓ {len(items)} registros de calendário de submissão sincronizados no banco e salvos em 002_seed_calendario.sql")

def run_step_3_seed_formularios(conn, db_type):
    print("\n[MIGRATION 2.c] Convertendo mapeamento_formularios.json em SQL...")
    json_path = os.path.join(DATA_DIR, 'mapeamento_formularios.json')
    if not os.path.exists(json_path):
        print(f" [ERRO] Arquivo não encontrado: {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        items = json.load(f)

    cursor = conn.cursor()
    sql_statements = []

    for item in items:
        formulario = item.get('formulario')
        normas = item.get('normas', '')
        docs_json = json.dumps(item.get('documentos_solicitados', []), ensure_ascii=False)

        if db_type == 'sqlite':
            cursor.execute("""
                INSERT INTO config_formularios (formulario, normas, documentos_solicitados, atualizado_em)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(formulario) DO UPDATE SET
                    normas=excluded.normas,
                    documentos_solicitados=excluded.documentos_solicitados,
                    atualizado_em=CURRENT_TIMESTAMP
            """, (formulario, normas, docs_json))
        else:
            cursor.execute("""
                INSERT INTO config_formularios (formulario, normas, documentos_solicitados, atualizado_em)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT(formulario) DO UPDATE SET
                    normas=EXCLUDED.normas,
                    documentos_solicitados=EXCLUDED.documentos_solicitados,
                    atualizado_em=CURRENT_TIMESTAMP
            """, (formulario, normas, docs_json))

        normas_escaped = normas.replace("'", "''")
        docs_escaped = docs_json.replace("'", "''")
        formulario_escaped = formulario.replace("'", "''")
        sql_statements.append(
            f"INSERT INTO config_formularios (formulario, normas, documentos_solicitados) "
            f"VALUES ('{formulario_escaped}', '{normas_escaped}', '{docs_escaped}') "
            f"ON CONFLICT(formulario) DO UPDATE SET normas='{normas_escaped}', documentos_solicitados='{docs_escaped}';"
        )

    conn.commit()

    # Salva arquivo SQL exportável
    with open(os.path.join(MIGRATIONS_DIR, '003_seed_formularios.sql'), 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_statements))

    print(f" ✓ {len(items)} configurações de formulários sincronizadas no banco e salvas em 003_seed_formularios.sql")

def main():
    print("=" * 70)
    print("    FEALQFLOW - MOTOR DE MIGRATION & RASTREABILIDADE DE SESSÕES")
    print("=" * 70)
    ensure_directories()
    result = get_connection()
    conn = result[0]
    db_type = result[1]

    try:
        run_step_1_create_tables(conn, db_type)
        run_step_2_seed_calendario(conn, db_type)
        run_step_3_seed_formularios(conn, db_type)

        print("\n" + "=" * 70)
        print("✓ TODAS AS MIGRATIONS FORAM APLICADAS COM SUCESSO!")
        print(f"  Banco ativo: {db_type.upper()} ({SQLITE_DB_PATH if db_type == 'sqlite' else 'PostgreSQL Remoto'})")
        print(f"  Scripts SQL gerados em: {MIGRATIONS_DIR}")
        print("=" * 70)
    finally:
        conn.close()

if __name__ == '__main__':
    main()
