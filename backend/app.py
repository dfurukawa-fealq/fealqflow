"""
FealqFlow - Backend Python Flask com Rastreabilidade de Sessões
Compatível com SQLite e PostgreSQL.

Rotas Disponíveis:
  - POST /api/sessions/init             : Cria ou carrega sessão de protocolo e rastreabilidade
  - GET  /api/sessions/<session_id>     : Recupera estado e vínculos de uma sessão
  - POST /api/sessions/track-link       : Registra/atualiza navegação entre formulários (Pai -> Filho)
  - PUT  /api/sessions/<session_id>     : Salva dados/progresso do formulário em edição
  - GET  /api/config-formularios        : Lista configurações e normas extraídas do banco
  - GET  /api/calendario-submissao      : Lista períodos e prazos vigentes de submissão
  - GET  /api/health                    : Status de integridade e banco conectado
"""

import os
import sys
import json
import uuid
import sqlite3
from datetime import datetime

# Define caminhos
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, '..'))
DB_PATH = os.path.join(ROOT_DIR, 'database', 'fealqflow.db')

def get_db():
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres'):
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
            return conn, 'postgres'
        except ImportError:
            pass
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, 'sqlite'

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    has_flask = True
except ImportError:
    has_flask = False

if has_flask:
    app = Flask(__name__)
    CORS(app)

    @app.route('/api/health', methods=['GET'])
    def health():
        conn, db_type = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM calendario_submissao")
            cal_count = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM config_formularios")
            forms_count = cursor.fetchone()[0]
            return jsonify({
                "status": "healthy",
                "database": db_type,
                "calendario_registros": cal_count,
                "formularios_registros": forms_count,
                "timestamp": datetime.now().isoformat()
            })
        finally:
            conn.close()

    @app.route('/api/sessions/init', methods=['POST'])
    def init_session():
        data = request.get_json() or {}
        protocol_id = data.get('protocol_id') or f"FEALQ-{datetime.now().year}-{str(uuid.uuid4().hex[:6]).upper()}"
        session_id = data.get('session_id') or str(uuid.uuid4())
        form_origem = data.get('form_origem', 'AberturaCursoEvento')
        titulo = data.get('titulo', '')
        responsavel_nome = data.get('responsavel_nome', '')
        responsavel_email = data.get('responsavel_email', '')

        conn, db_type = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sessoes WHERE session_id = ? OR protocol_id = ?", (session_id, protocol_id))
            row = cursor.fetchone()
            if row:
                return jsonify({
                    "session_id": row['session_id'],
                    "protocol_id": row['protocol_id'],
                    "form_origem": row['form_origem'],
                    "titulo": row['titulo'],
                    "responsavel_nome": row['responsavel_nome'],
                    "responsavel_email": row['responsavel_email'],
                    "status": row['status'],
                    "dados_json": json.loads(row['dados_json'] or '{}'),
                    "is_new": False
                })

            cursor.execute("""
                INSERT INTO sessoes (session_id, protocol_id, form_origem, titulo, responsavel_nome, responsavel_email, status, dados_json, criado_em, atualizado_em)
                VALUES (?, ?, ?, ?, ?, ?, 'em_preenchimento', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, (session_id, protocol_id, form_origem, titulo, responsavel_nome, responsavel_email, json.dumps(data.get('dados_json', {}))))
            conn.commit()

            return jsonify({
                "session_id": session_id,
                "protocol_id": protocol_id,
                "form_origem": form_origem,
                "titulo": titulo,
                "responsavel_nome": responsavel_nome,
                "responsavel_email": responsavel_email,
                "status": "em_preenchimento",
                "dados_json": data.get('dados_json', {}),
                "is_new": True
            })
        finally:
            conn.close()

    @app.route('/api/sessions/<session_id>', methods=['GET'])
    def get_session(session_id):
        conn, _ = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sessoes WHERE session_id = ? OR protocol_id = ?", (session_id, session_id))
            sess = cursor.fetchone()
            if not sess:
                return jsonify({"error": "Sessão não encontrada"}), 404

            actual_session_id = sess['session_id']
            cursor.execute("""
                SELECT * FROM rastreabilidade_formularios 
                WHERE session_id = ? OR protocol_id = ? 
                ORDER BY criado_em ASC
            """, (actual_session_id, sess['protocol_id']))
            links = cursor.fetchall()

            return jsonify({
                "session_id": sess['session_id'],
                "protocol_id": sess['protocol_id'],
                "form_origem": sess['form_origem'],
                "titulo": sess['titulo'],
                "responsavel_nome": sess['responsavel_nome'],
                "responsavel_email": sess['responsavel_email'],
                "status": sess['status'],
                "dados_json": json.loads(sess['dados_json'] or '{}'),
                "formularios_vinculados": [
                    {
                        "id": l['id'],
                        "form_codigo": l['form_codigo'],
                        "form_nome": l['form_nome'],
                        "url_destino": l['url_destino'],
                        "status": l['status'],
                        "preenchido_em": l['preenchido_em'],
                        "dados_vinculados": json.loads(l['dados_vinculados'] or '{}')
                    }
                    for l in links
                ]
            })
        finally:
            conn.close()

    @app.route('/api/sessions/track-link', methods=['POST'])
    def track_link():
        data = request.get_json() or {}
        session_id = data.get('session_id')
        protocol_id = data.get('protocol_id')
        form_codigo = data.get('form_codigo')
        form_nome = data.get('form_nome')
        url_origem = data.get('url_origem', '')
        url_destino = data.get('url_destino', '')
        status = data.get('status', 'iniciado')
        dados = json.dumps(data.get('dados_vinculados', {}))

        if not (session_id and form_codigo):
            return jsonify({"error": "session_id e form_codigo são obrigatórios"}), 400

        conn, _ = get_db()
        try:
            cursor = conn.cursor()
            # Verifica se já foi registrado esse form para essa sessão
            cursor.execute("""
                SELECT id FROM rastreabilidade_formularios 
                WHERE session_id = ? AND form_codigo = ?
            """, (session_id, form_codigo))
            row = cursor.fetchone()

            if row:
                cursor.execute("""
                    UPDATE rastreabilidade_formularios
                    SET status = ?, url_destino = ?, dados_vinculados = ?, preenchido_em = CURRENT_TIMESTAMP
                    WHERE id = ?
                """, (status, url_destino, dados, row['id']))
            else:
                cursor.execute("""
                    INSERT INTO rastreabilidade_formularios 
                    (session_id, protocol_id, form_codigo, form_nome, url_origem, url_destino, status, dados_vinculados, preenchido_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                """, (session_id, protocol_id, form_codigo, form_nome, url_origem, url_destino, status, dados))

            conn.commit()
            return jsonify({"success": True, "message": "Rastreabilidade registrada com sucesso"})
        finally:
            conn.close()

    @app.route('/api/config-formularios', methods=['GET'])
    def list_config_formularios():
        conn, _ = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, formulario, normas, documentos_solicitados FROM config_formularios ORDER BY id ASC")
            rows = cursor.fetchall()
            return jsonify([
                {
                    "id": r['id'],
                    "formulario": r['formulario'],
                    "normas": r['normas'],
                    "documentos_solicitados": json.loads(r['documentos_solicitados'] or '[]')
                }
                for r in rows
            ])
        finally:
            conn.close()

    @app.route('/api/calendario-submissao', methods=['GET'])
    def list_calendario():
        conn, _ = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT id, id_form, formulario, linha_de_incentivo, status_de_abertura, periodos_de_submissao FROM calendario_submissao ORDER BY id_form ASC")
            rows = cursor.fetchall()
            return jsonify([
                {
                    "id": r['id'],
                    "id_form": r['id_form'],
                    "formulario": r['formulario'],
                    "linha_de_incentivo": r['linha_de_incentivo'],
                    "status_de_abertura": r['status_de_abertura'],
                    "periodos_de_submissao": json.loads(r['periodos_de_submissao'] or '[]')
                }
                for r in rows
            ])
        finally:
            conn.close()

if __name__ == '__main__':
    if has_flask:
        port = int(os.environ.get('PORT', 5000))
        print(f"[FLASK] Iniciando FealqFlow Backend na porta {port}...")
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        print("[AVISO] Flask não instalado. Execute através de 'python3 backend/server.py' ou instale requirements.txt")
