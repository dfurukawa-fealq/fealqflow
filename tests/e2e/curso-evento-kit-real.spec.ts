import 'dotenv/config';
import { expect, Page, test } from '@playwright/test';

const PDF_DEMO = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

const preencherCampos = async (page: Page, marcador: string) => {
  const campos = page.locator('input:visible, textarea:visible, select:visible');
  for (let indice = 0; indice < await campos.count(); indice += 1) {
    const campo = campos.nth(indice);
    const tipo = await campo.getAttribute('type');
    if (tipo === 'checkbox' || tipo === 'radio' || tipo === 'file' || await campo.isDisabled()) continue;
    if (tipo === 'date') await campo.fill('2026-11-09');
    else if (tipo === 'number') await campo.fill('1');
    else if (tipo === 'email') await campo.fill(`e2e.${indice}@example.org`);
    else if (tipo === 'tel') await campo.fill('19999999999');
    else if (await campo.evaluate((elemento) => elemento.tagName === 'SELECT')) {
      const valor = await campo.locator('option:not([value=""])').first().getAttribute('value');
      if (valor) await campo.selectOption(valor);
    } else if (/cpf/i.test((await campo.getAttribute('placeholder')) || '')) {
      await campo.fill('123.456.789-09');
    } else await campo.fill(`${marcador} ${indice + 1}`);
  }
};

const login = async (page: Page) => {
  const usuario = process.env.ADMIN_USER;
  const senha = process.env.ADMIN_PASSWORD;
  test.skip(!usuario || !senha, 'Configure ADMIN_USER e ADMIN_PASSWORD para executar testes que gravam solicitações reais.');
  await page.goto('/admin/login');
  await page.locator('#admin-username').fill(usuario as string);
  await page.locator('#admin-password').fill(senha as string);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/\/admin\/login/);
};

const criarProtocolo = async (page: Page, possuiConvenio: 'sim' | 'nao') => {
  await page.goto('/projetos/form-curso-evento');
  await expect(page).toHaveURL(/\/projetos\/form-curso-evento\?processo=/);
  await page.locator(`input[name="possuiConvenio"][value="${possuiConvenio}"]`).check();
  await preencherCampos(page, `E2E Curso Evento ${possuiConvenio.toUpperCase()}`);
  await page.getByRole('button', { name: 'Salvar Rascunho' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Rascunho salvo/i })).toBeVisible();
  return page.url();
};

const anexarNoKit = async (page: Page, id: string, nome: string) => {
  const item = page.locator(`[data-documento-id="${id}"]`).last();
  const arquivo = item.locator('input[type="file"]');
  await expect(arquivo).toBeAttached();
  await arquivo.setInputFiles({ name: nome, mimeType: 'application/pdf', buffer: PDF_DEMO });
  await expect(item).toHaveAttribute('data-preenchido', 'SIM');
  await expect(item).toHaveAttribute('data-emitido', 'SIM');
};

const concluirLGPD = async (page: Page) => {
  const item = page.locator('[data-documento-id="termo-lgpd"]').last();
  await item.click();
  await expect(page).toHaveURL(/\/projetos\/termo-lgpd/);
  await preencherCampos(page, 'E2E LGPD Curso Evento');
  const aceite = page.locator('input[type="checkbox"]:visible').last();
  await aceite.check();
  const confirmar = page.getByRole('button', { name: /Confirmar Leitura e Assinar/i });
  await expect(confirmar).toBeEnabled();
  await confirmar.click();
  await expect(page.getByText(/Leitura confirmada|certifica/i).first()).toBeVisible();
  await page.getByRole('link', { name: /Voltar ao Protocolo/i }).click();
  await expect(page).toHaveURL(/\/projetos\/form-curso-evento\?/);
  const atualizado = page.locator('[data-documento-id="termo-lgpd"]').last();
  await expect(atualizado).toHaveAttribute('data-preenchido', 'SIM');
  await expect(atualizado).toHaveAttribute('data-emitido', 'SIM');
};

const concluirCadastroCoordenador = async (page: Page) => {
  await page.locator('[data-documento-id="cadastro-coordenador"]').last().click();
  await expect(page).toHaveURL(/\/projetos\/form-coordenador/);
  await preencherCampos(page, 'E2E Coordenador');
  for (const [id, nome] of [
    ['rg-cpf', 'rg-cpf-demo.pdf'],
    ['vinculo', 'vinculo-demo.pdf'],
  ]) {
    const item = page.locator(`[data-documento-id="${id}"]`).last();
    await item.locator('input[type="file"]').setInputFiles({ name: nome, mimeType: 'application/pdf', buffer: PDF_DEMO });
    await expect(item).toHaveAttribute('data-preenchido', 'SIM');
  }
  const enviar = page.getByRole('button', { name: 'Salvar e Cadastrar Coordenador' });
  await expect(enviar).toBeEnabled();
  await enviar.click();
  await expect(page).toHaveURL(/\/projetos\/form-curso-evento\?/);
  const itemPai = page.locator('[data-documento-id="cadastro-coordenador"]').last();
  await expect(itemPai).toHaveAttribute('data-preenchido', 'SIM');
  await expect(itemPai).toHaveAttribute('data-emitido', 'SIM');
};

const concluirPlanoRecursos = async (page: Page) => {
  await page.locator('[data-documento-id="plano-aplicacao-recursos"]').last().click();
  await expect(page).toHaveURL(/\/projetos\/form-plano-recursos/);
  await expect(page.getByRole('button', { name: 'Salvar e Enviar' })).toBeEnabled();
  await page.getByRole('button', { name: 'Salvar e Enviar' }).click();
  await expect(page.getByRole('heading', { name: 'Processo enviado' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
};

const validarItemEmitido = async (page: Page, id: string) => {
  const item = page.locator(`[data-documento-id="${id}"]`).last();
  await expect(item, `Documento ${id} não está preenchido`).toHaveAttribute('data-preenchido', 'SIM');
  await expect(item, `Documento ${id} não está emitido`).toHaveAttribute('data-emitido', 'SIM');
};

const validarProtocoloCompleto = async (page: Page, totalDocumentos: number) => {
  await expect(page.getByText(`${totalDocumentos}/${totalDocumentos}`, { exact: true })).toBeVisible();
  await expect(page.getByText('100%', { exact: true })).toBeVisible();
  const enviar = page.getByRole('button', { name: 'Submeter Protocolo de Evento' });
  await expect(enviar).toBeEnabled();
  await enviar.click();
  await expect(page.getByRole('heading', { name: 'Processo enviado' })).toBeVisible();
  await expect(page.getByText(/foi registrado no servidor/i)).toBeVisible();
};

test.describe('Protocolo de Abertura de Curso/Evento — kit documental real', () => {
  test('sem convênio USP: conclui formulário, LGPD, coordenador, programação e plano de recursos', async ({ page }) => {
    await login(page);
    const urlPai = await criarProtocolo(page, 'nao');

    await concluirLGPD(page);
    await concluirCadastroCoordenador(page);
    await anexarNoKit(page, 'programacao-evento', 'programacao-curso-evento-demo.pdf');
    await concluirPlanoRecursos(page);

    await page.goto(urlPai);
    await validarItemEmitido(page, 'termo-lgpd');
    await validarItemEmitido(page, 'cadastro-coordenador');
    await validarItemEmitido(page, 'programacao-evento');
    await validarItemEmitido(page, 'plano-aplicacao-recursos');
    await expect(page.locator('[data-documento-id="convenio-usp-assinado"]')).toHaveCount(0);
    await expect(page.locator('[data-documento-id="caracterizacao-academica"]')).toHaveCount(0);
    await expect(page.locator('[data-documento-id="caracterizacao-financeira"]')).toHaveCount(0);
    await validarProtocoloCompleto(page, 4);
  });

  test('com convênio USP: conclui formulário, LGPD, coordenador, programação e os três anexos USP', async ({ page }) => {
    await login(page);
    const urlPai = await criarProtocolo(page, 'sim');

    await concluirLGPD(page);
    await concluirCadastroCoordenador(page);
    await anexarNoKit(page, 'programacao-evento', 'programacao-curso-evento-demo.pdf');
    await anexarNoKit(page, 'convenio-usp-assinado', 'convenio-usp-assinado-demo.pdf');
    await anexarNoKit(page, 'caracterizacao-academica', 'caracterizacao-academica-demo.pdf');
    await anexarNoKit(page, 'caracterizacao-financeira', 'caracterizacao-financeira-demo.pdf');

    await page.goto(urlPai);
    for (const id of [
      'termo-lgpd',
      'cadastro-coordenador',
      'programacao-evento',
      'convenio-usp-assinado',
      'caracterizacao-academica',
      'caracterizacao-financeira',
    ]) await validarItemEmitido(page, id);
    await expect(page.locator('[data-documento-id="plano-aplicacao-recursos"]')).toHaveCount(0);
    await validarProtocoloCompleto(page, 6);
  });
});
