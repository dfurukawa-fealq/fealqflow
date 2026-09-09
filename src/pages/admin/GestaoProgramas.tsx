import { GestaoLayout } from './GestaoLayout';
import { useAdmin } from '../../contexts/AdminContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const GestaoProgramas = () => {
  const { orcamentos, linhasApoio, formularios, movimentacoes, getSaldoOrcamento } = useAdmin();

  // 1. Saldo por Linha de Apoio
  const saldoPorLinha = linhasApoio.map((linha) => {
    // Find all forms for this linha
    const formsLinha = formularios.filter(f => f.linhaApoioId === linha.id);
    // Find all orcamentos for these forms
    const orcamentosLinha = orcamentos.filter(o => formsLinha.some(f => f.id === o.formularioId));
    
    let totalValue = 0;
    let totalSaldo = 0;
    
    orcamentosLinha.forEach(o => {
      totalValue += o.valorGlobal;
      totalSaldo += getSaldoOrcamento(o.id);
    });

    return {
      name: linha.nome,
      'Valor Inicial': totalValue,
      'Saldo Atual': totalSaldo,
    };
  }).filter(item => item['Valor Inicial'] > 0);

  // 2. Saldo por Formulário
  const saldoPorFormulario = formularios.map(form => {
    const orcamentosForm = orcamentos.filter(o => o.formularioId === form.id);
    
    let totalValue = 0;
    let totalSaldo = 0;
    
    orcamentosForm.forEach(o => {
      totalValue += o.valorGlobal;
      totalSaldo += getSaldoOrcamento(o.id);
    });

    return {
      name: form.nome,
      'Valor Inicial': totalValue,
      'Saldo Atual': totalSaldo,
    };
  }).filter(item => item['Valor Inicial'] > 0);

  // 3. Oscilação de Saída por Semana (Movimentações)
  // Agrupar movimentações de saída (Transferencia origem, Reducao) por semana/mes
  // Para simplificar, agruparemos por data (dia) para visualização, já que mock pode não ter semanas espalhadas
  const saidasPorData = movimentacoes
    .filter(m => m.tipo === 'Reducao' || m.tipo === 'Transferencia')
    .reduce((acc, m) => {
      const data = m.data;
      if (!acc[data]) acc[data] = 0;
      acc[data] += m.valor;
      return acc;
    }, {} as Record<string, number>);

  const oscilacaoData = Object.keys(saidasPorData).sort().map(data => ({
    data,
    'Valor Saída': saidasPorData[data],
  }));

  // Formatter para tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <GestaoLayout 
      title="Dashboard de Programas" 
      description="Visão geral e gráficos de orçamentos e movimentações dos programas de apoio."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico 1: Por Linha de Apoio */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface mb-4">Saldo por Linha de Apoio</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={saldoPorLinha} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{fill: '#49454f', fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => `R$ ${val / 1000}k`} tick={{fill: '#49454f', fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: 12}} />
                <Bar dataKey="Valor Inicial" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saldo Atual" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição de Saldo (Pie Chart) - Opcional */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant">
          <h2 className="text-lg font-bold text-on-surface mb-4">Distribuição de Saldo Atual (Linhas)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={saldoPorLinha}
                  dataKey="Saldo Atual"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  label={(entry) => entry.name}
                  paddingAngle={2}
                >
                  {saldoPorLinha.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 3: Saldo por Formulário */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant lg:col-span-2">
          <h2 className="text-lg font-bold text-on-surface mb-4">Saldo por Formulário</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={saldoPorFormulario} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                <XAxis type="number" tickFormatter={(val) => `R$ ${val / 1000}k`} tick={{fill: '#49454f', fontSize: 12}} />
                <YAxis dataKey="name" type="category" width={150} tick={{fill: '#49454f', fontSize: 12}} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: 12}} />
                <Bar dataKey="Valor Inicial" fill="#FFBB28" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Saldo Atual" fill="#00C49F" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 4: Oscilação de Saídas */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant lg:col-span-2">
          <h2 className="text-lg font-bold text-on-surface mb-4">Oscilação de Saídas de Recursos (Por Dia)</h2>
          <div className="h-[300px] w-full">
            {oscilacaoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={oscilacaoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="data" tick={{fill: '#49454f', fontSize: 12}} />
                  <YAxis tickFormatter={(val) => `R$ ${val / 1000}k`} tick={{fill: '#49454f', fontSize: 12}} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: 12}} />
                  <Line type="monotone" dataKey="Valor Saída" stroke="#FF8042" strokeWidth={3} dot={{r: 5, fill: '#FF8042'}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant italic">
                Não há histórico de movimentações de saída para exibir.
              </div>
            )}
          </div>
        </div>
      </div>
    </GestaoLayout>
  );
};
