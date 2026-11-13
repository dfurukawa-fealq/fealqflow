const versao = '016_codigos_formularios_como_ids';

const formularios = [
  ['apoio-formula-rio-solicitaa-a-o-de-apoio-pesquisa-auxa-lio-viagem-0', 'APO-VIA-001'],
  ['apoio-edital-infraestrutura-e-melhorias-2026-1', 'APO-INF-001'],
  ['apoio-formula-rio-de-solicitaa-a-o-de-apoio-cultura-e-extensa-o-universita-ria-2', 'APO-CUL-001'],
  ['apoio-formula-rio-de-solicitaa-a-o-de-apoio-interesse-da-comunidade-3', 'APO-COM-001'],
  ['apoio-formula-rio-de-solicitaa-a-o-de-apoio-ensino-bolsa-acada-mica-pa-s-graduaa-a-o-4', 'APO-BPG-001'],
  ['apoio-formula-rio-solicitaa-a-o-de-apoio-a-auxa-lio-publicaa-a-es-de-artigos-5', 'APO-PUB-001'],
  ['apoio-formula-rio-de-solicitaa-a-o-de-apoio-cultura-e-extensa-o-material-eventos-6', 'APO-MAT-001'],
  ['apoio-formula-rio-solicitaa-a-o-de-apoio-pesquisa-apresentaa-a-o-trabalho-evento-7', 'APO-EVT-001'],
  ['apoio-formula-rio-de-solicitaa-a-o-de-apoio-ensino-bolsa-acada-mica-graduaa-a-o-8', 'APO-BAG-001'],
  ['projeto-abertura-curso-evento', 'PRJ-CEV-001'],
  ['projeto-pesquisa', 'PRJ-PSQ-002'],
  ['projeto-pesquisa-v2', 'PRJ-PSQ-003'],
  ['projeto-publicacao', 'PRJ-PUB-001'],
  ['projeto-coordenador', 'PRJ-COO-001'],
  ['projeto-plano-trabalho', 'PRJ-PTB-001'],
  ['projeto-patrocinador', 'PRJ-PAT-001'],
  ['projeto-parceiro', 'PRJ-PAR-001'],
  ['projeto-cotas', 'PRJ-COT-001'],
  ['projeto-financiadora', 'PRJ-FIN-001'],
  ['projeto-plano-recursos', 'PRJ-REC-001'],
  ['projeto-programa-epe', 'PRJ-EPE-001'],
  ['projeto-central-multiusuario', 'PRJ-CMU-001'],
  ['documento-orientacoes-coordenador', 'PRJ-ORI-003'],
  ['documento-termo-lgpd', 'PRJ-LGP-005'],
  ['documento-ciencia-departamento', 'PRJ-CCD-001'],
];

const aliasesDeRota = [
  ['form-coordenador', 'PRJ-COO-001'],
  ['form-curso', 'PRJ-CEV-001'],
  ['form-evento', 'PRJ-CEV-001'],
  ['form-curso-evento', 'PRJ-CEV-001'],
  ['form-publicacao', 'PRJ-PUB-001'],
  ['form-pesquisa', 'PRJ-PSQ-002'],
  ['form-pesquisa-v2', 'PRJ-PSQ-003'],
  ['form-trabalho', 'PRJ-PTB-001'],
  ['form-patrocinador', 'PRJ-PAT-001'],
  ['form-parceiro', 'PRJ-PAR-001'],
  ['form-cotas', 'PRJ-COT-001'],
  ['form-financiadora', 'PRJ-FIN-001'],
  ['form-plano-recursos', 'PRJ-REC-001'],
  ['form-programa-epe', 'PRJ-EPE-001'],
  ['form-central', 'PRJ-CMU-001'],
  ['orientacoes-coordenador', 'PRJ-ORI-003'],
  ['termo-lgpd', 'PRJ-LGP-005'],
  ['ciencia-departamento', 'PRJ-CCD-001'],
  ['apoio-bolsa-pos', 'APO-BPG-001'],
  ['apoio-bolsa-grad', 'APO-BAG-001'],
  ['apoio-infra', 'APO-INF-001'],
  ['apoio-evento-trabalho', 'APO-EVT-001'],
  ['apoio-viagem', 'APO-VIA-001'],
  ['apoio-publicacao', 'APO-PUB-001'],
  ['apoio-comunidade', 'APO-COM-001'],
  ['apoio-material-evento', 'APO-MAT-001'],
  ['apoio-cultura', 'APO-CUL-001'],
];

export async function executar(pool) {
  const aplicada = await pool.query('SELECT 1 FROM schema_migrations WHERE version = $1', [versao]);
  if (aplicada.rowCount) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [idAntigo, idCodigo] of formularios) {
      const antigo = await client.query('SELECT 1 FROM cadastros_formularios WHERE id = $1', [idAntigo]);
      if (!antigo.rowCount) continue;

      await client.query(`
        INSERT INTO cadastros_formularios
          (id, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao,
           active, habilitado, nseq, dados_legados)
        SELECT $2, nome, tipo, tipo_cadastro, linha_apoio_id, status, normas, periodos_submissao,
               active, habilitado, nseq, dados_legados
        FROM cadastros_formularios WHERE id = $1
        ON CONFLICT (id) DO NOTHING
      `, [idAntigo, idCodigo]);

      await client.query(`
        INSERT INTO cadastro_documentos (id, nome, descricao, template_url, active, criado_em, atualizado_em)
        SELECT $2, nome, descricao, template_url, active, criado_em, atualizado_em
        FROM cadastro_documentos WHERE id = $1
        ON CONFLICT (id) DO NOTHING
      `, [idAntigo, idCodigo]);
      await client.query('UPDATE itens_kit_documental SET cadastro_documento_id = $2 WHERE cadastro_documento_id = $1', [idAntigo, idCodigo]);
      await client.query('UPDATE kits_documentais SET formulario_id = $2 WHERE formulario_id = $1', [idAntigo, idCodigo]);
      await client.query('DELETE FROM cadastro_documentos WHERE id = $1', [idAntigo]);
      await client.query('DELETE FROM cadastros_formularios WHERE id = $1', [idAntigo]);
    }

    for (const [idAntigo, idCodigo] of [...formularios, ...aliasesDeRota]) {
      await client.query('UPDATE processos SET formulario_id = $2 WHERE formulario_id = $1', [idAntigo, idCodigo]);
    }

    await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [versao]);
    await client.query('COMMIT');
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    client.release();
  }
}
