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
    else if (tipo === 'email') await campo.fill(`pesquisa.e2e.${indice}@example.org`);
    else if (tipo === 'tel') await campo.fill('19999999999');
    else if (/cpf/i.test((await campo.getAttribute('placeholder')) || '')) await campo.fill('123.456.789-09');
    else if (await campo.evaluate((elemento) => elemento.tagName === 'SELECT')) {
      const valor = await campo.locator('option:not([value=""])').first().getAttribute('value');
      if (valor) await campo.selectOption(valor);
    } else await campo.fill(`${marcador} ${indice + 1}`);
  }
};

const login = async (page: Page) => {
  const usuario = process.env.ADMIN_USER;
  const senha = process.env.ADMIN_PASSWORD;
  test.skip(!usuario || !senha, 'Configure ADMIN_USER e ADMIN_PASSWORD para executar os testes que gravam solicitações reais.');
  await page.goto('/admin/login');
  await page.locator('#admin-username').fill(usuario as string);
  await page.locator('#admin-password').fill(senha as string);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/\/admin\/login/);
};

const criarProtocoloPesquisa = async (page: Page, possuiConvenio: boolean) => {
  await page.goto('/projetos/form-pesquisa-v2');
  await expect(page).toHaveURL(/\/projetos\/form-pesquisa-v2\?processo=/);
  await page.locator('input[name="possuiConvenioPesquisa"]').nth(possuiConvenio ? 0 : 1).check();
  await preencherCampos(page, `E2E Pesquisa ${possuiConvenio ? 'COM' : 'SEM'} CONVENIO`);
  await page.getByRole('button', { name: 'Salvar Rascunho' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Rascunho salvo/i })).toBeVisible();
  return page.url();
};

const anexarNoKit = async (page: Page, id: string, nome: string) => {
  const item = page.locator(`[data-documento-id="${id}"]`).last();
  await expect(item.locator('input[type="file"]')).toBeAttached();
  await item.locator('input[type="file"]').setInputFiles({ name: nome, mimeType: 'application/pdf', buffer: PDF_DEMO });
  await expect(item).toHaveAttribute('data-preenchido', 'SIM');
  await expect(item).toHaveAttribute('data-emitido', 'SIM');
};

const concluirLGPD = async (page: Page) => {
  await page.locator('[data-documento-id="termo-lgpd"]').last().click();
  await expect(page).toHaveURL(/\/projetos\/termo-lgpd/);
  await preencherCampos(page, 'E2E LGPD Pesquisa');
  await page.locator('input[type="checkbox"]:visible').last().check();
  const confirmar = page.getByRole('button', { name: /Confirmar Leitura e Assinar/i });
  await expect(confirmar).toBeEnabled();
  await confirmar.click();
  await expect(page.getByText(/Leitura confirmada|certifica/i).first()).toBeVisible();
  await page.getByRole('link', { name: /Voltar ao Protocolo/i }).click();
  await expect(page).toHaveURL(/\/projetos\/form-pesquisa-v2\?/);
};

const concluirOrientacoes = async (page: Page) => {
  await page.locator('[data-documento-id="orientacoes-coordenador"]').last().click();
  await expect(page).toHaveURL(/\/projetos\/orientacoes-coordenador/);
  await page.getByRole('button', { name: /Marcar Todos os 15 Itens como Lidos/i }).click();
  await page.getByRole('button', { name: /Confirmar Leitura e Ciência das 15 Orientações/i }).click();
  const concluir = page.getByRole('button', { name: 'Concluir e Retornar ao Protocolo' });
  await expect(concluir).toBeEnabled();
  await concluir.click();
  await expect(page).toHaveURL(/\/projetos\/form-pesquisa-v2\?/);
};

const concluirCadastroCoordenador = async (page: Page) => {
  await page.locator('[data-documento-id="cadastro-coordenador"]').last().click();
  await expect(page).toHaveURL(/\/projetos\/form-coordenador/);
  await preencherCampos(page, 'E2E Coordenador Pesquisa');
  for (const [id, nome] of [['rg-cpf', 'rg-cpf-pesquisa-demo.pdf'], ['vinculo', 'vinculo-pesquisa-demo.pdf']]) {
    const item = page.locator(`[data-documento-id="${id}"]`).last();
    await item.locator('input[type="file"]').setInputFiles({ name: nome, mimeType: 'application/pdf', buffer: PDF_DEMO });
    await expect(item).toHaveAttribute('data-preenchido', 'SIM');
  }
  const enviar = page.getByRole('button', { name: 'Salvar e Cadastrar Coordenador' });
  await expect(enviar).toBeEnabled();
  await enviar.click();
  await expect(page).toHaveURL(/\/projetos\/form-pesquisa-v2\?/);
};

const concluirPlanoRecursos = async (page: Page, urlPai: string) => {
  await page.locator('[data-documento-id="plano-aplicacao-recursos"]').last().click();
  await expect(page).toHaveURL(/\/projetos\/form-plano-recursos/);
  const enviar = page.getByRole('button', { name: 'Salvar e Enviar' });
  await expect(enviar).toBeEnabled();
  await enviar.click();
  await expect(page.getByRole('heading', { name: 'Processo enviado' })).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.goto(urlPai);
};

const validarItem = async (page: Page, id: string) => {
  const item = page.locator(`[data-documento-id="${id}"]`).last();
  await expect(item, `Item ${id} deve estar preenchido`).toHaveAttribute('data-preenchido', 'SIM');
  await expect(item, `Item ${id} deve estar emitido`).toHaveAttribute('data-emitido', 'SIM');
};

const finalizarProtocolo = async (page: Page) => {
  await expect(page.getByText('5/5', { exact: true })).toBeVisible();
  const enviar = page.getByRole('button', { name: 'Submeter Projeto para FEALQ' });
  await expect(enviar).toBeEnabled();
  await enviar.click();
  await expect(page.getByRole('heading', { name: 'Processo enviado' })).toBeVisible();
  await expect(page.getByText(/foi registrado no servidor/i)).toBeVisible();
};

test.describe('Processo de Abertura de Projeto de Pesquisa — kit documental real', () => {
  test('sem convênio USP: completa LGPD, orientações, cadastro do coordenador e plano de recursos', async ({ page }) => {
    await login(page);
    const urlPai = await criarProtocoloPesquisa(page, false);
    await concluirLGPD(page);
    await concluirOrientacoes(page);
    await concluirCadastroCoordenador(page);
    await concluirPlanoRecursos(page, urlPai);

    await page.goto(urlPai);
    for (const id of ['processo-pesquisa', 'cadastro-coordenador', 'plano-aplicacao-recursos', 'termo-lgpd', 'orientacoes-coordenador']) {
      await validarItem(page, id);
    }
    await expect(page.locator('[data-documento-id="planilha-recursos-usp"]')).toHaveCount(0);
    await finalizarProtocolo(page);
  });

  test('com convênio USP: completa LGPD, orientações, cadastro do coordenador e planilha USP', async ({ page }) => {
    await login(page);
    const urlPai = await criarProtocoloPesquisa(page, true);
    await concluirLGPD(page);
    await concluirOrientacoes(page);
    await concluirCadastroCoordenador(page);
    await anexarNoKit(page, 'planilha-recursos-usp', 'planilha-recursos-usp-pesquisa-demo.pdf');

    await page.goto(urlPai);
    for (const id of ['processo-pesquisa', 'cadastro-coordenador', 'planilha-recursos-usp', 'termo-lgpd', 'orientacoes-coordenador']) {
      await validarItem(page, id);
    }
    await expect(page.locator('[data-documento-id="plano-aplicacao-recursos"]')).toHaveCount(0);
    await finalizarProtocolo(page);
  });
});
