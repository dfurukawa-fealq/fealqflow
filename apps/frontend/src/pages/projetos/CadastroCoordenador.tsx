import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProcessoState } from '../../contexts/ProcessoContext';
import { useRastreabilidade } from '../../contexts/RastreabilidadeContext';
import { FormPageLayout } from '../../components/form/FormPageLayout';
import { FormSection } from '../../components/form/FormSection';
import { Field } from '../../components/form/Field';
import { KitDocumental } from '../../components/KitDocumental';
import { DocumentoExigido } from '../../data/programasApoio';
import { EnderecoField } from '../../components/form/EnderecoField';

const DOCUMENTO_FORMULARIO: DocumentoExigido = {
  id: 'formulario-online',
  label: 'Formulário Online Preenchido',
  descricao: 'Concluído automaticamente após o preenchimento dos campos obrigatórios.',
  tipo: 'gerado',
  obrigatorio: true,
};

export const CadastroCoordenador = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { marcarFormularioConcluido } = useRastreabilidade();
  const [nome, setNome] = useProcessoState('cadastroCoordenadorNome', '', ['campo:Nome Completo']);
  const [cpf, setCpf] = useProcessoState('cadastroCoordenadorCpf', '', ['campo:CPF']);
  const [rg, setRg] = useProcessoState('cadastroCoordenadorRg', '', ['campo:RG']);
  const [dataNascimento, setDataNascimento] = useProcessoState('cadastroCoordenadorDataNascimento', '', ['campo:Data de Nascimento']);
  const [sexo, setSexo] = useProcessoState('cadastroCoordenadorSexo', '', ['campo:Sexo']);
  const [nacionalidade, setNacionalidade] = useProcessoState('cadastroCoordenadorNacionalidade', 'Brasileira', ['campo:Nacionalidade']);
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useProcessoState('cadastroCoordenadorTelefoneWhatsApp', '');
  const [telefoneResidencial, setTelefoneResidencial] = useProcessoState('cadastroCoordenadorTelefoneResidencial', '');
  const [telefoneComercial, setTelefoneComercial] = useProcessoState('cadastroCoordenadorTelefoneComercial', '');
  const [universidade, setUniversidade] = useProcessoState('cadastroCoordenadorUniversidade', '');
  const [unidade, setUnidade] = useProcessoState('cadastroCoordenadorUnidade', '', ['campo:Unidade']);
  const [cargo, setCargo] = useProcessoState('cadastroCoordenadorCargo', '', ['campo:Cargo']);
  const [emailInstitucional, setEmailInstitucional] = useProcessoState('cadastroCoordenadorEmailInstitucional', '', ['campo:E-mail Institucional']);
  const [telefoneRamal, setTelefoneRamal] = useProcessoState('cadastroCoordenadorTelefoneRamal', '', ['campo:Telefone (Ramal)']);
  const [enderecoPrincipalCompleto, setEnderecoPrincipalCompleto] = useState(false);
  const [banco, setBanco] = useProcessoState('cadastroCoordenadorBanco', '', ['campo:Banco']);
  const [agencia, setAgencia] = useProcessoState('cadastroCoordenadorAgencia', '', ['campo:Agência']);
  const [contaCorrente, setContaCorrente] = useProcessoState('cadastroCoordenadorContaCorrente', '', ['campo:Conta Corrente']);
  const atualizarValidadeEndereco = useCallback((completo: boolean) => setEnderecoPrincipalCompleto(completo), []);
  const camposObrigatoriosPreenchidos = Boolean(
    nome.trim() && cpf.replace(/\D/g, '').length === 11 && rg.replace(/\D/g, '').length >= 7
    && dataNascimento && sexo && nacionalidade.trim() && telefoneWhatsApp.replace(/\D/g, '').length >= 10
    && universidade.trim() && unidade && cargo.trim()
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInstitucional) && telefoneRamal.replace(/\D/g, '').length >= 8
    && enderecoPrincipalCompleto && banco && agencia.trim() && contaCorrente.trim()
  );
  const documentos: DocumentoExigido[] = [{
    ...DOCUMENTO_FORMULARIO,
    status: camposObrigatoriosPreenchidos ? 'concluido' : 'pendente',
  }];
  const retornarAoProtocolo = () => {
    marcarFormularioConcluido('CONV-FR-07-CADT', { origem: 'Protocolo de Abertura de Curso/Evento' });
    const processoPai = searchParams.get('processo_pai');
    const protocolo = searchParams.get('protocolo');
    const sessao = searchParams.get('sessao');
    if (processoPai) {
      const rotaSolicitada = searchParams.get('rota_retorno');
      const rotaRetorno = rotaSolicitada === '/projetos/form-pesquisa-v2' || rotaSolicitada === '/projetos/form-pesquisa'
        ? rotaSolicitada
        : '/projetos/form-curso-evento';
      const parametros = new URLSearchParams({ processo: processoPai });
      if (protocolo) parametros.set('protocolo', protocolo);
      if (sessao) parametros.set('sessao', sessao);
      navigate(`${rotaRetorno}?${parametros.toString()}`);
    }
  };

  return (
  <FormPageLayout
    breadcrumb={['Área do Coordenador', 'Cadastro de Coordenador']}
    titulo="Cadastro de Coordenador"
    codigo="PRJ-COO-001"
    acaoPrincipal="Salvar e Cadastrar Coordenador"
    acaoIcone="save"
    podeEnviar={camposObrigatoriosPreenchidos}
    aoSubmeter={retornarAoProtocolo}
    sidebar={<KitDocumental acaoNoCard documentos={documentos} nota="O formulário será concluído automaticamente após o preenchimento obrigatório." />}
  >
    <FormSection numero={1} icone="badge" titulo="Dados Pessoais">
      <Field label="Nome Completo" placeholder="Nome conforme documento" valor={nome} onChange={setNome} obrigatorio />
      <Field label="CPF" span={6} placeholder="000.000.000-00" valor={cpf} onChange={setCpf} mascara="cpf" obrigatorio />
      <Field label="RG" span={6} placeholder="00.000.000-0" valor={rg} onChange={setRg} mascara="rg" obrigatorio />
      <Field label="Data de Nascimento" span={6} tipo="date" valor={dataNascimento} onChange={setDataNascimento} obrigatorio />
      <Field
        label="Sexo"
        span={6}
        tipo="select"
        placeholder="Selecione..."
        opcoes={['Feminino', 'Masculino', 'Outro', 'Prefiro não informar']}
        valor={sexo}
        onChange={setSexo}
        obrigatorio
      />
      <Field label="Nacionalidade" span={6} valor={nacionalidade} onChange={setNacionalidade} obrigatorio />
      <Field label="WhatsApp" span={4} tipo="tel" mascara="telefone" placeholder="(19) 99999-9999" valor={telefoneWhatsApp} onChange={setTelefoneWhatsApp} obrigatorio />
      <Field label="Telefone Residencial" span={4} tipo="tel" mascara="telefone" placeholder="(19) 9999-9999" valor={telefoneResidencial} onChange={setTelefoneResidencial} />
      <Field label="Telefone Comercial" span={4} tipo="tel" mascara="telefone" placeholder="(19) 9999-9999" valor={telefoneComercial} onChange={setTelefoneComercial} />
    </FormSection>

    <FormSection numero={2} icone="school" titulo="Dados Institucionais">
      <Field label="Universidade" span={6} placeholder="Ex.: Universidade de São Paulo" valor={universidade} onChange={setUniversidade} obrigatorio />
      <Field
        label="Unidade"
        span={6}
        tipo="select"
        placeholder="Selecione a Unidade..."
        opcoes={['ESALQ', 'CENA', 'FZEA']}
        valor={unidade}
        onChange={setUnidade}
        obrigatorio
      />
      <Field label="Cargo" span={4} placeholder="Professor Titular, etc." valor={cargo} onChange={setCargo} obrigatorio />
      <Field
        label="E-mail Institucional"
        span={4}
        tipo="email"
        placeholder="usuario@usp.br"
        valor={emailInstitucional}
        onChange={setEmailInstitucional}
        obrigatorio
      />
      <Field
        label="Telefone (Ramal)"
        span={4}
        tipo="tel"
        mascara="telefone"
        placeholder="(19) 3429-0000"
        valor={telefoneRamal}
        onChange={setTelefoneRamal}
        obrigatorio
      />
    </FormSection>

    <FormSection numero={3} icone="location_on" titulo="Endereço Principal, Fatura e Cobrança">
      <EnderecoField
        titulo="Endereço Principal"
        descricao="Endereço principal do coordenador"
        prefixo="coordenadorEnderecoPrincipal"
        obrigatorio
        onValidadeChange={atualizarValidadeEndereco}
        aliases={{
          Cep: ['campo:CEP'],
          Logradouro: ['campo:Logradouro'],
          Numero: ['campo:Número'],
          Bairro: ['campo:Bairro'],
          Cidade: ['campo:Cidade'],
          Uf: ['campo:Estado (UF)'],
        }}
      />
      {/* <EnderecoField
        titulo="Endereço para Fatura"
        descricao="Endereço utilizado na emissão de faturas"
        prefixo="coordenadorEnderecoFatura"
      />
      <EnderecoField
        titulo="Endereço para Cobrança"
        descricao="Endereço utilizado para correspondências de cobrança"
        prefixo="coordenadorEnderecoCobranca"
      /> */}
    </FormSection>

    <FormSection numero={4} icone="account_balance" titulo="Dados Bancários">
      <Field
        label="Banco"
        tipo="select"
        placeholder="Selecione o Banco..."
        opcoes={['001 - Banco do Brasil']}
        valor={banco}
        onChange={setBanco}
        obrigatorio
      />
      <Field label="Agência" span={6} placeholder="0000-X" valor={agencia} onChange={setAgencia} obrigatorio />
      <Field label="Conta Corrente" span={6} placeholder="00000-X" valor={contaCorrente} onChange={setContaCorrente} obrigatorio />
      <div className="col-span-12">
        <div className="bg-primary-fixed/20 border border-primary-fixed p-sm rounded flex gap-sm items-start">
          <span className="material-symbols-outlined text-primary text-[16px]">
            info
          </span>
          <p className="text-[12px] text-on-surface-variant">
            A conta bancária informada deve obrigatoriamente estar vinculada ao
            CPF do coordenador (conta de mesma titularidade).
          </p>
        </div>
      </div>
    </FormSection>
  </FormPageLayout>
  );
};

