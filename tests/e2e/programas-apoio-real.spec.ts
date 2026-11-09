import 'dotenv/config';
import { expect, Page, test } from '@playwright/test';

const formularios = [
  { nome: 'Bolsa Pós-Graduação', rota: '/programas-de-apoio/apoio-bolsa-pos', marcador: 'E2E Bolsa Pos' },
  { nome: 'Bolsa Graduação', rota: '/programas-de-apoio/apoio-bolsa-grad', marcador: 'E2E Bolsa Grad' },
  { nome: 'Apoio à Infraestrutura', rota: '/programas-de-apoio/apoio-infra', marcador: 'E2E Infraestrutura' },
  { nome: 'Apresentação em Evento', rota: '/programas-de-apoio/apoio-evento-trabalho', marcador: 'E2E Evento' },
  { nome: 'Auxílio Viagem', rota: '/programas-de-apoio/apoio-viagem', marcador: 'E2E Viagem' },
  { nome: 'Auxílio Publicação', rota: '/programas-de-apoio/apoio-publicacao', marcador: 'E2E Publicacao' },
  { nome: 'Interesse da Comunidade', rota: '/programas-de-apoio/apoio-comunidade', marcador: 'E2E Comunidade' },
  { nome: 'Material para Eventos', rota: '/programas-de-apoio/apoio-material-evento', marcador: 'E2E Material' },
  { nome: 'Cultura e Extensão', rota: '/programas-de-apoio/apoio-cultura', marcador: 'E2E Cultura' },
] as const;

const preencherCamposVisiveis = async (page: Page, marcador: string) => {
  const campos = page.locator('input:visible, textarea:visible, select:visible');
  for (let indice = 0; indice < await campos.count(); indice += 1) {
    const campo = campos.nth(indice);
    const tipo = await campo.getAttribute('type');
    if (tipo === 'checkbox' || tipo === 'radio' || tipo === 'file' || await campo.isDisabled()) continue;
    if (tipo === 'date') await campo.fill('2026-11-09');
    else if (tipo === 'number') await campo.fill('100');
    else if (await campo.evaluate((elemento) => elemento.tagName === 'SELECT')) {
      const valor = await campo.locator('option:not([value=""])').first().getAttribute('value');
      if (valor) await campo.selectOption(valor);
    } else await campo.fill(`${marcador} ${indice + 1}`);
  }
};

const preencherUploads = async (page: Page, marcador: string) => {
  const arquivos = page.locator('input[type="file"]');
  for (let indice = 0; indice < await arquivos.count(); indice += 1) {
    await arquivos.nth(indice).setInputFiles({
      name: `${marcador.toLowerCase().replaceAll(' ', '-')}-${indice + 1}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from(`Documento de teste ${marcador} ${indice + 1}`),
    });
  }
};

const validarKitCompleto = async (page: Page) => {
  const contador = page.getByText(/^\d+\/\d+$/).first();
  await expect(contador).toBeVisible();
  const valor = await contador.textContent();
  const partes = (valor || '').split('/').map(Number);
  expect(partes[0], `Kit incompleto: ${valor}`).toBe(partes[1]);
};

test('preenche e salva todos os formulários de Programa de Apoios no banco real', async ({ page }) => {
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
    await expect(page).toHaveURL(new RegExp(`${formulario.rota}\\?processo=`));
    await preencherCamposVisiveis(page, formulario.marcador);
    await preencherUploads(page, formulario.marcador);
    await page.getByRole('button', { name: 'Salvar Rascunho' }).click();
    await expect(page.getByRole('status')).toContainText(/salvo/i);
    await validarKitCompleto(page);
  }

  await page.goto('/programas-de-apoio/painel');
  await expect(page.getByRole('heading', { name: /Painel de Solicitações/i })).toBeVisible();
  for (const formulario of formularios) {
    await expect(page.getByText(formulario.nome, { exact: true }).first()).toBeVisible();
  }
});
