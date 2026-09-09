interface StatusCardProps {
  titulo?: string;
  rotulo?: string;
  /** Percentual de 0 a 100. */
  percentual: number;
  nota?: string;
}

/** Card de progresso do preenchimento, exibido na coluna lateral. */
export const StatusCard = ({
  titulo = 'Status do Protocolo',
  rotulo = 'Preenchimento',
  percentual,
  nota,
}: StatusCardProps) => (
  <section className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm p-lg">
    <h3 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-sm pb-xs border-b border-surface-variant">
      {titulo}
    </h3>
    <div className="flex items-center justify-between mb-xs">
      <span className="text-[13px] text-on-surface">{rotulo}</span>
      <span className="text-[11px] font-bold text-primary">{percentual}%</span>
    </div>
    <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden mb-sm">
      <div
        className="bg-secondary h-full transition-all"
        style={{ width: `${percentual}%` }}
      />
    </div>
    {nota && (
      <p className="text-[11px] text-on-surface-variant italic leading-tight">
        {nota}
      </p>
    )}
  </section>
);
