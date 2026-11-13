import 'dotenv/config';
import { randomBytes, randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });

test('primeira flag salva o novo processo sem duplicar o protocolo', async ({ page, baseURL }) => {
  test.skip(!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD, 'Credenciais locais necessarias.');
  await page.goto('/admin/login');
  await page.locator('#admin-username').fill(process.env.ADMIN_USER!);
  await page.locator('#admin-password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/admin\/login/);
  let criacoes = 0;
  page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/processos') criacoes++; });
  await page.goto('/projetos/form-curso-evento');
  await page.getByLabel(/Título do Curso\/Evento/).fill('E2E primeiro salvamento automatico');
  await page.locator('input[name="possuiConvenio"][value="sim"]').check();
  await expect(page).toHaveURL(/processo=[0-9a-f-]{36}/);
  const id = new URL(page.url()).searchParams.get('processo')!;
  try {
    await expect(page.getByLabel(/Título do Curso\/Evento/)).toHaveValue('E2E primeiro salvamento automatico');
    await page.locator('[data-documento-id="cadastro-coordenador"]').last().click();
    await expect(page).toHaveURL(/form-coordenador/);
    expect(new URL(page.url()).searchParams.get('processo_pai')).toBe(id);
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`processo=${id}`));
    expect(criacoes).toBe(1);
  } finally {
    await page.request.post('/api/processos/inativar', { headers: { Origin: new URL(baseURL!).origin }, data: { ids: [id] } });
  }
});

test('salva antes de navegar/cancelar, recupera subformulario e registra falhas', async ({ page, baseURL, playwright }) => {
  test.setTimeout(90_000);
  test.skip(!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD, 'Credenciais locais necessarias.');
  const origem = new URL(baseURL!).origin;
  await page.goto('/admin/login');
  await page.locator('#admin-username').fill(process.env.ADMIN_USER!);
  await page.locator('#admin-password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/admin\/login/);

  const token = randomBytes(32).toString('base64url');
  const criado = await page.request.post('/api/processos', { headers: { Origin: origem }, data: {
    categoria: 'projeto', formularioId: 'PRJ-CEV-001', formularioNome: 'Teste de resiliencia',
    formularioRota: '/projetos/form-curso-evento', chaveCriacao: randomUUID(), token,
  } });
  expect(criado.ok()).toBeTruthy();
  const pai = await criado.json();
  const headers = { Origin: origem, 'x-processo-token': token };
  let criacoesIndevidas = 0;
  page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/processos') criacoesIndevidas++; });
  try {
    await page.evaluate(({ id, token }) => localStorage.setItem(`@Fealq:processo:${id}`, token), { id: pai.id, token });
    await page.goto(`/projetos/form-curso-evento?processo=${pai.id}`);
    const titulo = page.getByLabel(/Título do Curso\/Evento/);
    await titulo.fill('E2E persistencia antes de abrir');
    await page.locator('[data-documento-id="cadastro-coordenador"]').last().click();
    await expect(page).toHaveURL(/form-coordenador/);
    expect(new URL(page.url()).searchParams.get('processo_pai')).toBe(pai.id);
    const lerPai = async () => (await page.request.get(`/api/processos/${pai.id}`, { headers })).json();
    expect((await lerPai()).dados_json.campos.titulo).toBe('E2E persistencia antes de abrir');

    await page.getByLabel(/^Nome Completo/).fill('Coordenador teste resiliencia');
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`processo=${pai.id}`));
    const salvo = await lerPai();
    expect(salvo.status).toBe('rascunho');
    expect(salvo.dados_json.campos.__subformularios['/projetos/form-coordenador'].campos.cadastroCoordenadorNome).toBe('Coordenador teste resiliencia');

    await page.locator('[data-documento-id="cadastro-coordenador"]').last().click();
    await expect(page.getByLabel(/^Nome Completo/)).toHaveValue('Coordenador teste resiliencia');
    await page.route(`**/api/processos/${pai.id}`, async (route) => {
      if (route.request().method() === 'PATCH') await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Falha simulada de persistencia' }) });
      else await route.continue();
    });
    await page.getByLabel(/^Nome Completo/).fill('Alteracao durante falha');
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Falha simulada' }).first()).toBeVisible();
    await expect(page).toHaveURL(/form-coordenador/);
    await page.unroute(`**/api/processos/${pai.id}`);
    await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`processo=${pai.id}`));

    await page.locator('input[name="possuiConvenio"][value="sim"]').check();
    await expect.poll(async () => (await lerPai()).dados_json.campos.possuiConvenio).toBe('sim');
    await page.getByLabel('Tipo de Evento', { exact: false }).fill('Cong');
    await page.getByRole('button', { name: 'Congresso', exact: true }).click();
    await expect.poll(async () => (await lerPai()).dados_json.campos.tipoEvento).toBe('Congresso');
    const upload = page.locator('[data-documento-id] input[type="file"]').first();
    const item = upload.locator('xpath=ancestor::*[@data-documento-id][1]');
    await upload.setInputFiles({ name: 'resiliencia-demo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF') });
    await expect.poll(async () => (await lerPai()).documentos.some((doc: { arquivo_nome: string }) => doc.arquivo_nome === 'resiliencia-demo.pdf')).toBeTruthy();
    const download = page.waitForEvent('download');
    await item.getByRole('button', { name: 'Baixar anexo', exact: true }).click();
    expect((await download).suggestedFilename()).toBe('resiliencia-demo.pdf');

    const eventos = await page.request.get(`/api/processos/${pai.id}/eventos`, { headers });
    expect(eventos.ok()).toBeTruthy();
    const logs = await eventos.json();
    expect(logs.some((e: { acao: string; resultado: string }) => e.acao === 'cancelar' && e.resultado === 'falha')).toBeTruthy();
    expect(logs.some((e: { acao: string; resultado: string }) => e.acao === 'abrir_item_kit' && e.resultado === 'sucesso')).toBeTruthy();
    for (const acao of ['alterar_flag', 'anexar_documento', 'baixar_anexo', 'selecionar_opcao']) {
      await expect.poll(async () => (await (await page.request.get(`/api/processos/${pai.id}/eventos`, { headers })).json()).some((e: { acao: string; resultado: string }) => e.acao === acao && e.resultado === 'sucesso')).toBeTruthy();
    }
    expect(criacoesIndevidas).toBe(0);
    const anonimo = await playwright.request.newContext({ baseURL });
    expect((await anonimo.get(`/api/processos/${pai.id}/eventos`)).status()).toBe(403);
    await anonimo.dispose();
    await page.getByText(/Hist.rico do processo/).click();
    await expect(page.getByRole('button', { name: /Atualizar hist.rico/ })).toBeVisible();
  } finally {
    await page.request.post('/api/processos/inativar', { headers: { Origin: origem }, data: { ids: [pai.id] } });
  }
});
