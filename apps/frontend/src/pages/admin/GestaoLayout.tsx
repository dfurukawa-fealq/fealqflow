import React, { FormEvent, ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';

interface GestaoLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const GestaoLayout = ({ title, description, children }: GestaoLayoutProps) => {
  const { resetToDefaults } = useAdmin();
  const { usuario, logout, alterarSenha } = useUser();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [erroSincronizacao, setErroSincronizacao] = useState('');
  const [erroSessao, setErroSessao] = useState('');
  const [mostrarAlteracaoSenha, setMostrarAlteracaoSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagemSenha, setMensagemSenha] = useState('');

  const handleLogout = async () => {
    setErroSessao('');
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (erro) {
      setErroSessao(erro instanceof Error ? erro.message : 'Não foi possível encerrar a sessão.');
    }
  };

  const handleAlterarSenha = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErroSessao('');
    setMensagemSenha('');
    if (novaSenha !== confirmarSenha) {
      setErroSessao('A confirmação não corresponde à nova senha.');
      return;
    }
    try {
      await alterarSenha(senhaAtual, novaSenha);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setMensagemSenha('Senha alterada. As outras sessões foram encerradas.');
      setMostrarAlteracaoSenha(false);
    } catch (erro) {
      setErroSessao(erro instanceof Error ? erro.message : 'Não foi possível alterar a senha.');
    }
  };

  const handleConfirmSync = async () => {
    setSincronizando(true);
    setErroSincronizacao('');
    try {
      await resetToDefaults();
      setIsModalOpen(false);
    } catch (erro) {
      setErroSincronizacao(erro instanceof Error ? erro.message : 'Falha ao sincronizar com o banco de dados.');
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div className="p-xl max-w-7xl mx-auto w-full relative">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">{title}</h1>
          <p className="text-on-surface-variant">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="px-2 text-sm text-on-surface-variant">{usuario?.username}</span>
          <button
            type="button"
            onClick={() => { setMensagemSenha(''); setMostrarAlteracaoSenha((aberto) => !aberto); }}
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant/40"
          >
            <span className="material-symbols-outlined text-[20px]">key</span>
            Alterar senha
          </button>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-variant/40"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Sair
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-error/10 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/20"
          >
            <span className="material-symbols-outlined text-[20px]">sync</span>
            Sincronizar Base Oficial
          </button>
        </div>
      </div>
      {mostrarAlteracaoSenha && (
        <form onSubmit={(event) => void handleAlterarSenha(event)} className="mb-5 grid gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:grid-cols-3">
          <label className="text-sm font-medium text-on-surface-variant">
            Senha atual
            <input autoComplete="current-password" className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-on-surface" onChange={(event) => setSenhaAtual(event.target.value)} required type="password" value={senhaAtual} />
          </label>
          <label className="text-sm font-medium text-on-surface-variant">
            Nova senha (mínimo 12 caracteres)
            <input autoComplete="new-password" className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-on-surface" minLength={12} onChange={(event) => setNovaSenha(event.target.value)} required type="password" value={novaSenha} />
          </label>
          <label className="text-sm font-medium text-on-surface-variant">
            Confirmar nova senha
            <input autoComplete="new-password" className="mt-1 w-full rounded-lg border border-outline-variant px-3 py-2 text-on-surface" minLength={12} onChange={(event) => setConfirmarSenha(event.target.value)} required type="password" value={confirmarSenha} />
          </label>
          <div className="flex items-center gap-2 sm:col-span-3 sm:justify-end">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90" type="submit">Salvar nova senha</button>
            <button className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface" onClick={() => setMostrarAlteracaoSenha(false)} type="button">Cancelar</button>
          </div>
        </form>
      )}
      {mensagemSenha && <p className="mb-4 text-sm text-green-700" role="status">{mensagemSenha}</p>}
      {erroSessao && <p className="mb-4 text-sm text-error" role="alert">{erroSessao}</p>}
      <div>
        {children}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl w-[450px] min-w-[300px] p-6 shadow-xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center gap-3 text-error mb-4">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h2 className="text-xl font-bold text-on-surface m-0">Atenção!</h2>
            </div>
            <p className="text-on-surface-variant mb-6 text-base leading-relaxed break-words w-full">
              Isso irá <strong>resetar todos os formulários e movimentações atuais</strong> e recriar os dados com base no mapeamento oficial. Você tem certeza que deseja continuar?
            </p>
            {erroSincronizacao && <div role="alert" className="mb-4 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">{erroSincronizacao}</div>}
            <div className="flex justify-end gap-3 w-full shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={sincronizando}
                className="px-5 py-2.5 text-on-surface font-semibold hover:bg-surface-variant/50 rounded-lg transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                onClick={() => void handleConfirmSync()}
                disabled={sincronizando}
                className="px-5 py-2.5 bg-error text-white font-semibold rounded-lg hover:bg-error/90 transition-colors shadow-sm whitespace-nowrap"
              >
                Sim, sincronizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
