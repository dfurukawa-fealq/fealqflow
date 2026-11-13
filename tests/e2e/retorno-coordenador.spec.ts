import 'dotenv/config';
import { randomBytes, randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';

test.use({ trace: 'off', video: 'off', screenshot: 'off' });

test('concluir coordenador retorna a rota original form-curso, com o mesmo processo e dados', async ({ page, baseURL }) => {
  test.skip(!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD, 'Credenciais locais necessarias.');
  const origem = new URL(baseURL!).origin;
  await page.goto('/admin/login');
  await page.locator('#admin-username').fill(process.env.ADMIN_USER!);
  await page.locator('#admin-password').fill(process.env.ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/admin\/login/);
  const token = randomBytes(32).toString('base64url');
  const resposta = await page.request.post('/api/processos', { headers: { Origin: origem }, data: {
    categoria: 'projeto', formularioId: 'PRJ-CEV-001', formularioNome: 'E2E retorno coordenador',
    formularioRota: '/projetos/form-curso', chaveCriacao: randomUUID(), token,
  } });
  expect(resposta.ok()).toBeTruthy();
  const pai = await resposta.json();
  const headers = { Origin: origem, 'x-processo-token': token };
  try {
    const camposCoordenador = {
      cadastroCoordenadorNome: 'Coordenador E2E', cadastroCoordenadorCpf: '123.456.789-09', cadastroCoordenadorRg: '12.345.678-9',
      cadastroCoordenadorDataNascimento: '1980-01-01', cadastroCoordenadorSexo: 'Masculino', cadastroCoordenadorNacionalidade: 'Brasileira',
      cadastroCoordenadorTelefoneWhatsApp: '19999999999', cadastroCoordenadorUniversidade: 'USP', cadastroCoordenadorUnidade: 'FZEA',
      cadastroCoordenadorCargo: 'Professor', cadastroCoordenadorEmailInstitucional: 'e2e@example.org', cadastroCoordenadorTelefoneRamal: '1934290000',
      cadastroCoordenadorBanco: '001 - Banco do Brasil', cadastroCoordenadorAgencia: '1234', cadastroCoordenadorContaCorrente: '56789',
      coordenadorEnderecoPrincipalCep: '13418900', coordenadorEnderecoPrincipalLogradouro: 'Rua E2E', coordenadorEnderecoPrincipalNumero: '10',
      coordenadorEnderecoPrincipalBairro: 'Centro', coordenadorEnderecoPrincipalCidade: 'Piracicaba', coordenadorEnderecoPrincipalUf: 'SP',
    };
    const dados = { campos: { titulo: 'Titulo original preservado E2E', __subformularios: { '/projetos/form-coordenador': { campos: camposCoordenador } } } };
    expect((await page.request.patch(`/api/processos/${pai.id}`, { headers, data: { dados, versao: pai.versao } })).ok()).toBeTruthy();
    await page.evaluate(({ id, token }) => localStorage.setItem(`@Fealq:processo:${id}`, token), { id: pai.id, token });
    let criacoes = 0;
    page.on('request', (request) => { if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/processos') criacoes++; });
    await page.goto(`/projetos/form-curso?processo=${pai.id}`);
    await expect(page.getByText(pai.protocolo, { exact: true })).toBeVisible();
    await page.locator('[data-documento-id="cadastro-coordenador"]').last().click();
    await expect(page).toHaveURL(/form-coordenador/);
    expect(new URL(page.url()).searchParams.get('rota_retorno')).toBe('/projetos/form-curso');
    await expect(page.locator('[data-processo-principal]')).toContainText(pai.protocolo);
    // Link legado sem rota_retorno tambem deve usar a rota oficial carregada do pai.
    const legado = new URL(page.url()); legado.searchParams.delete('rota_retorno');
    await page.goto(legado.href);
    const concluir = page.getByRole('button', { name: 'Concluir e Retornar ao Protocolo', exact: true });
    await expect(concluir).toBeEnabled();
    await concluir.click();
    await expect(page).toHaveURL((url) => url.pathname === '/projetos/form-curso' && url.searchParams.get('processo') === pai.id && !url.searchParams.has('processo_pai'));
    await expect(page.getByLabel(/Título do Curso\/Evento/)).toHaveValue('Titulo original preservado E2E');
    await expect(page.getByText(pai.protocolo, { exact: true })).toBeVisible();
    const salvo = await (await page.request.get(`/api/processos/${pai.id}`, { headers })).json();
    expect(salvo.dados_json.campos.__subformularios['/projetos/form-coordenador'].campos.__fealq_formulario_validado__).toBe(true);
    expect(salvo.dados_json.campos.__subformularios['/projetos/form-curso-evento']).toBeUndefined();
    expect(salvo.status).toBe('rascunho');
    for (const alias of ['form-curso-evento', 'form-evento']) {
      await page.goto(`/projetos/${alias}?processo=${pai.id}`);
      await expect(page).toHaveURL((url) => url.pathname === '/projetos/form-curso' && url.searchParams.get('processo') === pai.id && !url.searchParams.has('processo_pai'));
      await expect(page.getByLabel(/Título do Curso\/Evento/)).toHaveValue('Titulo original preservado E2E');
    }
    expect(criacoes).toBe(0);
  } finally {
    await page.request.post('/api/processos/inativar', { headers: { Origin: origem }, data: { ids: [pai.id] } });
  }
});
