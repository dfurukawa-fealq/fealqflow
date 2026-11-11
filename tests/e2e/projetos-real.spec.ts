import 'dotenv/config';
import { expect, Page, test } from '@playwright/test';

const formularios = [
  { nome: 'Plano de Aplicação de Recursos', rota: '/projetos/form-plano-recursos', marcador: 'E2E Plano de Aplicação' },
  { nome: 'Protocolo de Abertura de Curso/Evento', nomeNoPainel: 'Abertura de Curso/Evento', rota: '/projetos/form-curso-evento', marcador: 'E2E Curso Evento' },
  { nome: 'Processo de Abertura de Projeto de Pesquisa', rota: '/projetos/form-pesquisa-v2', marcador: 'E2E Projeto Pesquisa' },
] as const;

const preencherCamposVisiveis = async (page: Page, marcador: string) => {
  const campos = page.locator('input:visible, textarea:visible, select:visible');
  const total = await campos.count();
  for (let indice = 0; indice < total; indice += 1) {
    const campo = campos.nth(indice);
    const tipo = await campo.getAttribute('type');
    if (tipo === 'checkbox' || tipo === 'radio' || tipo === 'file') continue;
    if (await campo.isDisabled()) continue;
    if (tipo === 'date') {
      await campo.fill('2026-11-09');
    } else if (tipo === 'number') {
      await campo.fill('100');
    } else if (await campo.evaluate((elemento) => elemento.tagName === 'SELECT')) {
      const valor = await campo.locator('option:not([value=""])').first().getAttribute('value');
      if (valor) await campo.selectOption(valor);
    } else {
      await campo.fill(`${marcador} ${indice + 1}`);
    }
  }
};

const preencherUploadsDoKit = async (page: Page, marcador: string) => {
  const kit = page.getByText(/Kit de (Documentos|Documentação)/i).first();
  if (await kit.count() === 0) return;
  await expect(kit).toBeVisible();
  const arquivos = page.locator('input[type="file"]');
  const total = await arquivos.count();
  for (let indice = 0; indice < total; indice += 1) {
    await arquivos.nth(indice).setInputFiles({
      name: `${marcador.toLowerCase().replaceAll(' ', '-')}-${indice + 1}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from(`Documento de teste ${marcador} ${indice + 1}`),
    });
  }
  await expect(page.getByText(/Kit de (Documentos|Documentação)/i).first()).toBeVisible();
};

const validarKitCompleto = async (page: Page) => {
  const contador = page.getByText(/^\d+\/\d+$/).first();
  await expect(contador).toBeVisible();
  const valor = await contador.textContent();
  const partes = (valor || '').split('/').map(Number);
  expect(partes[0], `Kit incompleto: ${valor}`).toBe(partes[1]);
};

test('preenche e salva os três formulários de Projetos no banco real', async ({ page }) => {
  const usuario = process.env.ADMIN_USER;
  const senha = process.env.ADMIN_PASSWORD;
  test.skip(!usuario || !senha, 'ADMIN_USER e ADMIN_PASSWORD são necessários para o teste real.');

  await page.goto('/admin/login');
  await page.locator('#admin-username').fill(usuario as string);
  await page.locator('#admin-password').fill(senha as string);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/\/admin\/login/);

  for (const formulario of formularios) {
    await page.goto(formulario.rota);
    await expect(page).not.toHaveURL(/\?processo=/);
    await preencherCamposVisiveis(page, formulario.marcador);
    await page.getByRole('button', { name: 'Salvar Rascunho' }).click();
    await expect(page).toHaveURL(new RegExp(`${formulario.rota}\\?processo=`));
    await preencherUploadsDoKit(page, formulario.marcador);
    await validarKitCompleto(page);
  }

  await page.goto('/projetos/painel');
  await expect(page.getByRole('heading', { name: 'Painel de Solicitações - Projetos' })).toBeVisible();
  for (const formulario of formularios) {
    await expect(page.getByText('nomeNoPainel' in formulario ? formulario.nomeNoPainel : formulario.nome, { exact: true }).first()).toBeVisible();
  }
});
