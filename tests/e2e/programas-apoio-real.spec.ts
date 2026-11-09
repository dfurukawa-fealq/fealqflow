import 'dotenv/config';
import { expect, Page, test } from '@playwright/test';
import { PROGRAMAS_APOIO, ProgramaApoio } from '../../apps/frontend/src/data/programasApoio';

const PDF_DEMO = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

const dataISO = (diasAdiante: number) => {
  const data = new Date();
  data.setDate(data.getDate() + diasAdiante);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
};

const mesISO = (mesesAdiante: number) => {
  const data = new Date();
  data.setDate(1);
  data.setMonth(data.getMonth() + mesesAdiante);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
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

const descricaoCampo = async (campo: ReturnType<Page['locator']>) => campo.evaluate((elemento) => {
  const controle = elemento as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  return [
    controle.labels ? [...controle.labels].map((label) => label.textContent || '').join(' ') : '',
    controle.getAttribute('aria-label') || '',
    controle.getAttribute('name') || '',
    controle.getAttribute('placeholder') || '',
  ].join(' ').toLocaleLowerCase('pt-BR');
});

const preencherCamposDoFormulario = async (page: Page, marcador: string) => {
  const radios = page.locator('input[type="radio"]:visible');
  const nomesRadio = new Set<string>();
  for (let indice = 0; indice < await radios.count(); indice += 1) {
    const radio = radios.nth(indice);
    const nome = await radio.getAttribute('name') || `radio-${indice}`;
    if (nomesRadio.has(nome) || await radio.isDisabled()) continue;
    nomesRadio.add(nome);
    await radio.check();
  }

  const caixas = page.locator('input[type="checkbox"]:visible');
  for (let indice = 0; indice < await caixas.count(); indice += 1) {
    const caixa = caixas.nth(indice);
    if (await caixa.isEnabled() && !(await caixa.isChecked())) await caixa.check();
  }

  const campos = page.locator('input:visible, textarea:visible, select:visible');
  for (let indice = 0; indice < await campos.count(); indice += 1) {
    const campo = campos.nth(indice);
    const tipo = (await campo.getAttribute('type') || '').toLocaleLowerCase('pt-BR');
    if (['checkbox', 'radio', 'file', 'hidden', 'button', 'submit'].includes(tipo) || await campo.isDisabled()) continue;

    const descricao = await descricaoCampo(campo);
    if (tipo === 'email') {
      await campo.fill(`e2e.${indice}@example.org`);
    } else if (tipo === 'tel' || /telefone|celular|ramal/.test(descricao)) {
      await campo.fill('19987654321');
    } else if (tipo === 'month') {
      const prazo = /fim|t[eé]rmino|final/.test(descricao) ? 2 : 1;
      await campo.fill(mesISO(prazo));
    } else if (tipo === 'date') {
      const prazo = /retorno|fim|t[eé]rmino|final/.test(descricao) ? 30 : /in[ií]cio|partida|ida/.test(descricao) ? 14 : 21;
      await campo.fill(dataISO(prazo));
    } else if (tipo === 'number') {
      const minimo = Number(await campo.getAttribute('min'));
      await campo.fill(Number.isFinite(minimo) && minimo > 0 ? String(minimo) : '1');
    } else if (await campo.evaluate((elemento) => elemento.tagName === 'SELECT')) {
      const opcao = campo.locator('option:not([value=""]):not(:disabled)').first();
      const valor = await opcao.getAttribute('value');
      if (valor) await campo.selectOption(valor);
    } else if (/cpf/.test(descricao)) {
      await campo.fill('123.456.789-09');
    } else if (/valor|or[cç]amento|r\$/.test(descricao)) {
      await campo.fill('1000');
    } else {
      await campo.fill(`${marcador} ${indice + 1}`);
    }
  }
};

const anexarKitCompleto = async (page: Page, programa: ProgramaApoio, marcador: string) => {
  for (const documento of programa.documentos.filter((item) => item.tipo === 'upload')) {
    const item = page.locator(`[data-documento-id="${documento.id}"]`).last();
    await expect(item, `Item de kit ausente: ${programa.id}/${documento.id}`).toBeVisible();
    const arquivo = item.locator('input[type="file"]');
    await expect(arquivo, `Upload indisponível: ${documento.id}`).toBeAttached();
    await arquivo.setInputFiles({
      name: `${marcador.toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}-${documento.id}.pdf`,
      mimeType: 'application/pdf',
      buffer: PDF_DEMO,
    });
    await expect(item).toHaveAttribute('data-preenchido', 'SIM');
    await expect(item).toHaveAttribute('data-emitido', 'SIM');
  }
};

const validarEstadoCompletoDoKit = async (page: Page, programa: ProgramaApoio) => {
  const contador = page.getByText(/^\d+\/\d+$/).first();
  await expect(contador, 'Contador do kit não apareceu.').toBeVisible();
  const valor = (await contador.textContent()) || '';
  const [concluidos, total] = valor.split('/').map(Number);
  expect(concluidos, `Kit incompleto para ${programa.titulo}: ${valor}`).toBe(total);

  for (const documento of programa.documentos) {
    const item = page.locator(`[data-documento-id="${documento.id}"]`).last();
    await expect(item, `Item ${documento.id} não foi preenchido`).toHaveAttribute('data-preenchido', 'SIM');
    const estadoEmissao = documento.tipo === 'externo' ? 'NAO' : 'SIM';
    await expect(item, `Estado de emissão inesperado para ${documento.id}`).toHaveAttribute('data-emitido', estadoEmissao);
  }
};

const preencherEEnviar = async (page: Page, programa: ProgramaApoio) => {
  const marcador = `E2E ${programa.id} ${Date.now()}`;
  await page.goto(programa.path);
  await expect(page).toHaveURL(new RegExp(`${programa.path.replaceAll('/', '\\/')}\\?processo=`));
  await preencherCamposDoFormulario(page, marcador);
  await anexarKitCompleto(page, programa, marcador);
  await validarEstadoCompletoDoKit(page, programa);

  const camposObrigatorios = page.locator('main input:required:visible, main select:required:visible, main textarea:required:visible');
  for (let indice = 0; indice < await camposObrigatorios.count(); indice += 1) {
    const campo = camposObrigatorios.nth(indice);
    const descricao = await descricaoCampo(campo);
    const valido = await campo.evaluate((elemento) => (elemento as HTMLInputElement).checkValidity());
    expect(valido, `Campo obrigatório inválido: ${descricao}`).toBe(true);
  }

  const enviar = page.getByRole('button', { name: 'Submeter Pedido' });
  await expect(enviar, 'Envio continua bloqueado apesar do formulário e kit preenchidos.').toBeEnabled();
  await enviar.click();
  await expect(page.getByRole('heading', { name: 'Processo enviado' })).toBeVisible();
  const protocolo = (await page.locator('main p').textContent())?.match(/APO-\d{4}\/[A-F\d]+/)?.[0];
  expect(protocolo, 'A confirmação não apresentou o protocolo registrado.').toBeTruthy();

  await page.goto('/programas-de-apoio/painel');
  await expect(page.getByRole('heading', { name: 'Painel de Solicitações - Programas de Apoio' })).toBeVisible();
  const busca = page.getByPlaceholder('Buscar formulário, ID ou solicitante...');
  await busca.fill(protocolo as string);
  const linha = page.getByText(protocolo as string, { exact: true });
  await expect(linha, 'Protocolo enviado não apareceu no painel.').toBeVisible();
  await linha.click();
  const checklist = page.getByRole('heading', { name: /Checklist do Kit Documental/ });
  await expect(checklist).toBeVisible();
  await expect(page.getByText(/FALTANDO/i)).toHaveCount(0);
  await expect(page.getByText(`${programa.documentos.filter((item) => item.obrigatorio).length}/${programa.documentos.filter((item) => item.obrigatorio).length} Concluídos`, { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Ver Protocolo', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: /somente leitura/i })).toBeVisible();
  for (const documento of programa.documentos.filter((item) => item.obrigatorio)) {
    const item = page.locator(`[data-documento-id="${documento.id}"]`).last();
    await expect(item, `Estado do item ${documento.id} diverge no protocolo enviado`).toHaveAttribute('data-preenchido', 'SIM');
    const estadoEmissao = documento.tipo === 'externo' ? 'NAO' : 'SIM';
    await expect(item, `Emissão do item ${documento.id} diverge no protocolo enviado`).toHaveAttribute('data-emitido', estadoEmissao);
  }
};

test.describe('Programa de Apoios FEALQ — submissões reais com kit completo', () => {
  test.describe.configure({ mode: 'serial' });

  for (const programa of PROGRAMAS_APOIO) {
    test(`${programa.titulo}: preenche o formulário, conclui o kit e aparece no painel`, async ({ page }) => {
      await login(page);
      await preencherEEnviar(page, programa);
    });
  }
});
