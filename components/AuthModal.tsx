import React, { useState } from 'react';
import { signIn, signUp, confirmSignUp, signOut } from 'aws-amplify/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'confirm'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) {
        onLoginSuccess();
        onClose();
      } else if (nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { nextStep } = await signUp({
        username: email,
        password,
        options: { userAttributes: { email } }
      });
      if (nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
        setMode('confirm');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { isSignUpComplete } = await confirmSignUp({ username: email, confirmationCode: code });
      if (isSignUpComplete) {
        alert('Conta verificada! Faça login.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-purple-600 rounded-full opacity-10 blur-3xl"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-3xl font-black text-white mb-2">Pogo<span className="text-blue-500">Events</span></h1>
          <p className="text-slate-400 text-sm">Autenticação</p>
        </div>

        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-4 text-sm">{error}</div>}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition">
              {loading ? 'Carregando...' : 'Entrar'}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 cursor-pointer hover:text-blue-400" onClick={() => setMode('signup')}>
              Criar conta
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" required />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold transition">
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4 cursor-pointer hover:text-blue-400" onClick={() => setMode('login')}>
              Voltar para Login
            </p>
          </form>
        )}

        {mode === 'confirm' && (
          <form onSubmit={handleConfirm} className="space-y-4 relative z-10">
             <div className="text-center mb-4">
              <i className="fa-solid fa-envelope-open-text text-4xl text-yellow-400 mb-2"></i>
              <p className="text-xs text-slate-300">Digite o código enviado para {email}</p>
            </div>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white text-center text-2xl tracking-widest" placeholder="123456" required />
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition">
              {loading ? 'Verificando...' : 'Confirmar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;