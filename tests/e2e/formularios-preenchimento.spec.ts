import { expect, test } from '@playwright/test';

const formularios = [
  { nome: 'Plano de Aplicação de Recursos', rota: '/projetos/form-plano-recursos', categoria: 'projeto' },
  { nome: 'Protocolo de Abertura de Curso/Evento', rota: '/projetos/form-curso-evento', categoria: 'projeto' },
  { nome: 'Processo de Abertura de Projeto de Pesquisa', rota: '/projetos/form-pesquisa-v2', categoria: 'projeto' },
  { nome: 'Bolsa Acadêmica - Pós-graduação', rota: '/programas-de-apoio/apoio-bolsa-pos', categoria: 'apoio' },
  { nome: 'Bolsa Acadêmica - Graduação', rota: '/programas-de-apoio/apoio-bolsa-grad', categoria: 'apoio' },
  { nome: 'Apoio Infraestrutura e Melhorias', rota: '/programas-de-apoio/apoio-infra', categoria: 'apoio' },
  { nome: 'Apresentação de Trabalho em Evento', rota: '/programas-de-apoio/apoio-evento-trabalho', categoria: 'apoio' },
  { nome: 'Auxílio Viagem', rota: '/programas-de-apoio/apoio-viagem', categoria: 'apoio' },
  { nome: 'Auxílio para publicação de artigo', rota: '/programas-de-apoio/apoio-publicacao', categoria: 'apoio' },
  { nome: 'Apoio de Interesse da Comunidade', rota: '/programas-de-apoio/apoio-comunidade', categoria: 'apoio' },
  { nome: 'Apoio Material para Eventos', rota: '/programas-de-apoio/apoio-material-evento', categoria: 'apoio' },
  { nome: 'Cultura e Extensão Universitária', rota: '/programas-de-apoio/apoio-cultura', categoria: 'apoio' },
] as const;

const criarProcessoMock = (formulario: (typeof formularios)[number], id: string) => ({
  id,
  protocolo: `TESTE-${id.slice(0, 8)}`,
  categoria: formulario.categoria,
  formulario_id: formulario.rota.split('/').pop(),
  formulario_nome: formulario.nome,
  formulario_rota: formulario.rota,
  status: 'rascunho',
  dados_json: { campos: {} },
  versao: 0,
  documentos: [],
  token: 'token-de-teste-playwright',
});

for (const formulario of formularios) {
  test(`abre e permite iniciar preenchimento: ${formulario.nome}`, async ({ page }) => {
    const processoId = `00000000-0000-4000-8000-${String(formularios.indexOf(formulario) + 1).padStart(12, '0')}`;
    const processo = criarProcessoMock(formulario, processoId);

    await page.route('**/api/processos', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(processo) });
    });
    await page.route(`**/api/processos/${processoId}`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(processo) });
    });

    await page.goto(`${formulario.rota}?inicio=00000000-0000-4000-8000-000000000001`);
    await expect(page).toHaveURL(new RegExp(`${formulario.rota}\\?processo=${processoId}`));
    await expect(page.locator('body')).toContainText(/Salvar Rascunho|Salvar/);
    await expect(page.locator('input, textarea, select').first()).toBeVisible();
  });
}
