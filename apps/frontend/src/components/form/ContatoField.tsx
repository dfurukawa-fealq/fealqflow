import { useProcessoState } from '../../contexts/ProcessoContext';
import { Field } from './Field';

type CampoContato = 'Nome' | 'Email' | 'Telefone';

export interface ContatoFieldProps {
  titulo?: string;
  descricao?: string;
  prefixo?: string;
  obrigatorio?: boolean;
  aliases?: Partial<Record<CampoContato, string[]>>;
}

/** Grupo visual reutilizável para os dados de uma pessoa de contato. */
export const ContatoField = ({
  titulo = 'Contato',
  descricao = 'Pessoa responsável pelo relacionamento com a entidade',
  prefixo = 'contato',
  obrigatorio = false,
  aliases = {},
}: ContatoFieldProps) => {
  const [nome, setNome] = useProcessoState(`${prefixo}Nome`, '', aliases.Nome);
  const [email, setEmail] = useProcessoState(`${prefixo}Email`, '', aliases.Email);
  const [telefone, setTelefone] = useProcessoState(`${prefixo}Telefone`, '', aliases.Telefone);

  return (
    <div className="col-span-12 rounded-lg border border-outline-variant bg-surface-container-low/60 p-md">
      <div className="mb-sm flex items-center justify-between gap-sm border-b border-outline-variant/60 pb-xs">
        <h3 className="flex items-center gap-xs text-[13px] font-bold text-on-surface">
          <span className="material-symbols-outlined text-[19px] text-primary">contact_mail</span>
          {titulo}
        </h3>
        <span className="text-right text-[11px] text-on-surface-variant">{descricao}</span>
      </div>

      <div className="grid grid-cols-12 gap-sm">
        <Field
          label="Nome do Contato"
          span={4}
          placeholder="Nome da pessoa responsável"
          valor={nome}
          onChange={setNome}
          obrigatorio={obrigatorio}
        />
        <Field
          label="E-mail"
          span={4}
          tipo="email"
          placeholder="contato@empresa.com"
          valor={email}
          onChange={setEmail}
          obrigatorio={obrigatorio}
        />
        <Field
          label="WhatsApp / Telefone"
          span={4}
          tipo="tel"
          prefixo="+55"
          placeholder="(00) 00000-0000"
          valor={telefone}
          onChange={setTelefone}
          obrigatorio={obrigatorio}
        />
      </div>
    </div>
  );
};
