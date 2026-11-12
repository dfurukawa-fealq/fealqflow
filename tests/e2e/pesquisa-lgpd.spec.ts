import { expect, test } from '@playwright/test';
import type { DadosProcesso, DocumentoProcesso, Processo } from '../../apps/frontend/src/types/processo';
import { lerTextoProcesso } from '../../apps/frontend/src/utils/camposProcesso';

test('leitura aceita chaves canônicas, estáveis e legadas sem priorizar valores vazios', () => {
  expect(lerTextoProcesso({ 'campo:CPF': '', coordCpf: '123', 'campo:CPF:antigo': '456' }, 'coordCpf', 'CPF')).toBe('123');
  expect(lerTextoProcesso({ 'campo:Título do Projeto': 'Pesquisa' }, 'Título do Projeto')).toBe('Pesquisa');
  expect(lerTextoProcesso({ 'campo:CPF:antigo': '456' }, 'CPF')).toBe('456');
});

for (const formulario of [
  { nome: 'pesquisa', rota: '/projetos/form-pesquisa-v2', secao: 4, titulo: /^Título do Projeto/ },
  { nome: 'curso/evento', rota: '/projetos/form-curso', secao: 3, titulo: /^Título do Curso\/Evento/ },
]) {
test(`${formulario.nome}: vincular pai e LGPD sem dados pessoais na URL`, async ({ page }, testInfo) => {
  test.setTimeout(45000);
  const id = 'a6c5f772-6352-4ad1-a8df-3cd45b88dd86';
  let processo: Processo = {
    id, protocolo: 'FEALQ-E2E-PESQUISA', categoria: 'projeto', formulario_id: formulario.rota.split('/').pop() || '',
    formulario_nome: formulario.nome, formulario_rota: formulario.rota,
    status: 'rascunho', dados_json: { campos: {} }, versao: 1, documentos: [],
  };
  // API controlada: valida o fluxo do frontend sem depender de banco ou autenticação.
  await page.route('**/api/**', async (route) => {
    const requisicao = route.request();
    const caminho = new URL(requisicao.url()).pathname;
    if (caminho === '/api/auth/me') return route.fulfill({ json: { user: null } });
    if (caminho === '/api/formularios') return route.fulfill({ json: [] });
    if (caminho === '/api/processos' && requisicao.method() === 'POST') {
      const corpo = requisicao.postDataJSON() as { token: string };
      return route.fulfill({ json: { ...processo, token: corpo.token } });
    }
    if (caminho === `/api/processos/${id}` && requisicao.method() === 'PATCH') {
      const corpo = requisicao.postDataJSON() as { dados: DadosProcesso };
      processo = { ...processo, dados_json: corpo.dados, versao: processo.versao + 1 };
      return route.fulfill({ json: processo });
    }
    if (caminho === `/api/processos/${id}`) return route.fulfill({ json: processo });
    if (caminho === `/api/processos/${id}/documentos`) {
      const corpo = requisicao.postDataJSON() as { documentos: DocumentoProcesso[] };
      return route.fulfill({ json: corpo.documentos });
    }
    return route.fulfill({ status: 404, json: { error: 'Endpoint inesperado no teste' } });
  });
  await page.goto(formulario.rota);
  await page.getByLabel(formulario.titulo).fill('Pesquisa de integração LGPD');
  const secao = page.locator('section').filter({ has: page.getByRole('heading', { name: `${formulario.secao}. Coordenador Responsável`, exact: true }) });
  await secao.getByLabel(/Nome Completo do Coordenador/).fill('Coordenadora Teste LGPD');
  await secao.getByLabel(/^CPF/).fill('12345678909');
  await secao.getByLabel(/E-mail Institucional/).fill('coordenadora@example.org');
  await secao.getByLabel(/Departamento/).fill('Departamento de Pesquisa');
  await secao.screenshot({ path: testInfo.outputPath('01-coordenador.png') });
  await page.getByRole('button', { name: 'Salvar Rascunho' }).click();
  await expect(page).toHaveURL(new RegExp(`processo=${id}`));
  const termos = page.locator('section').filter({ has: page.getByRole('heading', { name: '7. Termos de LGPD e Confidencialidade', exact: true }) });
  await termos.getByRole('link', { name: /Declaro ter lido/ }).click();
  await expect(page).toHaveURL(/\/projetos\/termo-lgpd\?/);
  expect(new URL(page.url()).searchParams.get('processo_pai')).toBe(id);
  const parametros = new URL(page.url()).searchParams;
  for (const chave of ['coordenador', 'cpf', 'rg', 'email', 'departamento', 'projeto']) {
    expect(parametros.has(chave), `Dado pessoal indevido na URL: ${chave}`).toBe(false);
  }
  const auto = page.getByRole('button', { name: 'Auto preencher', exact: true });
  await expect(auto).toBeEnabled();
  // O filho começa vazio: somente Auto preencher consulta os dados do pai salvo.
  for (const rotulo of [/Nome Completo do Coordenador/, /^CPF/, /Departamento \/ Unidade/, /E-mail Institucional/, /Título do Projeto \/ Curso/]) {
    await expect(page.getByLabel(rotulo)).toHaveValue('');
  }
  await auto.click();
  await expect(page.getByLabel(/Nome Completo do Coordenador/)).toHaveValue('Coordenadora Teste LGPD');
  await expect(page.getByLabel(/^CPF/)).toHaveValue('123.456.789-09');
  await expect(page.getByLabel(/Departamento \/ Unidade/)).toHaveValue('Departamento de Pesquisa');
  await expect(page.getByLabel(/E-mail Institucional/)).toHaveValue('coordenadora@example.org');
  await expect(page.getByLabel(/Título do Projeto \/ Curso/)).toHaveValue('Pesquisa de integração LGPD');
  await page.locator('section').filter({ has: auto }).screenshot({ path: testInfo.outputPath('02-lgpd-autopreenchido.png') });
});
}
