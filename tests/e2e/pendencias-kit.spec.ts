import 'dotenv/config';
import { randomBytes, randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });

test('campos completos nao liberam envio com documentos obrigatorios pendentes', async ({ page, baseURL }) => {
  test.skip(!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD, 'Credenciais locais necessarias.');
  const origin = new URL(baseURL!).origin;
  await page.goto('/admin/login');
  await page.locator('#admin-username').fill(process.env.ADMIN_USER!);
  await page.locator('#admin-password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/admin\/login/);
  const token = randomBytes(32).toString('base64url');
  const criacao = await page.request.post('/api/processos', { headers: { Origin: origin }, data: {
    categoria: 'projeto', formularioId: 'PRJ-CEV-001', formularioNome: 'E2E pendencias kit',
    formularioRota: '/projetos/form-curso-evento', chaveCriacao: randomUUID(), token,
  } });
  expect(criacao.ok()).toBeTruthy();
  const pai = await criacao.json();
  const headers = { Origin: origin, 'x-processo-token': token };
  const protocolo = `FEALQ-${pai.id.replaceAll('-', '').slice(0, 20)}`;
  const sessao = `sess_${pai.id.replaceAll('-', '')}`;
  const campos = {
    titulo: 'E2E campos completos', tipoEvento: 'Congresso', publicoAlvo: 'Estudantes', cargaHoraria: '50',
    dataInicio: '2026-11-30', dataFim: '2026-12-01', coordNome: 'Coordenador E2E', coordCpf: '123.456.789-09',
    coordEmail: 'e2e@example.org', objetoProjeto: 'Objeto do teste', possuiConvenio: 'nao', aceiteTermoSigilo: true,
    __fealq_formulario_validado__: true,
  };
  try {
    const gravacao = await page.request.patch(`/api/processos/${pai.id}`, { headers, data: { dados: { campos }, versao: pai.versao } });
    expect(gravacao.ok()).toBeTruthy();
    await page.evaluate(({ id, token, protocolo, sessao }) => {
      localStorage.setItem(`@Fealq:processo:${id}`, token);
      localStorage.setItem(`@Fealq:rastreabilidade:sessao_${protocolo}`, JSON.stringify({
        protocolId: protocolo, sessionId: sessao, formOrigem: 'AberturaCursoEvento', status: 'em_preenchimento',
        formulariosVinculados: { 'CERT-LGPD-01': { formCodigo: 'CERT-LGPD-01', formNome: 'LGPD', urlDestino: '', status: 'concluido' } },
      }));
    }, { id: pai.id, token, protocolo, sessao });
    const url = `/projetos/form-curso-evento?processo=${pai.id}&protocolo=${protocolo}&sessao=${sessao}`;
    await page.goto(url);
    await expect(page.getByRole('button', { name: 'Ver documentos pendentes' })).toBeVisible();
    const aviso = page.getByRole('status').filter({ hasText: /Documentos obrigat.*pendentes no kit/ });
    await expect(aviso).toContainText('Cadastro de Coordenador');
    await expect(aviso).toContainText(/Plano de Aplica/);
    await expect(page.getByRole('button', { name: 'Submeter Protocolo de Evento', exact: true })).toBeDisabled();
    expect(await page.locator('input:required:invalid, select:required:invalid, textarea:required:invalid').count()).toBe(0);
    await page.getByRole('button', { name: 'Ver documentos pendentes' }).click();
    await expect(page.locator('[data-kit-documental]')).toBeInViewport();

    const atual = await (await page.request.get(`/api/processos/${pai.id}`, { headers })).json();
    const envio = await page.request.post(`/api/processos/${pai.id}/enviar`, { headers, data: { versao: atual.versao } });
    expect(envio.status()).toBe(409);
    const erro = await envio.json();
    expect(erro.error).toContain('obrigatórios');
    expect(erro.error).not.toContain('Ã');
    expect(erro.pendencias.map((item: { id: string }) => item.id).sort()).toEqual(['cadastro-coordenador', 'plano-aplicacao-recursos']);

    // Representa os dois subformularios salvos e validados no pai.
    const concluido = { ...atual.dados_json.campos, __subformularios: {
      '/projetos/form-coordenador': { campos: { __fealq_formulario_validado__: true } },
      '/projetos/form-plano-recursos': { campos: { __fealq_formulario_validado__: true } },
    } };
    expect((await page.request.patch(`/api/processos/${pai.id}`, { headers, data: { dados: { campos: concluido }, versao: atual.versao } })).ok()).toBeTruthy();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Submeter Protocolo de Evento', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Ver documentos pendentes' })).toHaveCount(0);
  } finally {
    await page.request.post('/api/processos/inativar', { headers: { Origin: origin }, data: { ids: [pai.id] } });
  }
});
