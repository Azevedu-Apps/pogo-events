
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
  const [rememberMe, setRememberMe] = useState(false);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      {/* Main Container - Split Layout */}
      <div className="relative w-full max-w-5xl h-[650px] bg-[#0b0e14] border border-blue-900/50 shadow-[0_0_60px_rgba(37,99,235,0.15)] flex overflow-hidden rounded-2xl">
        
        {/* Background Grid Pattern (Global) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none z-0" 
             style={{ backgroundImage: 'linear-gradient(#2962ff 1px, transparent 1px), linear-gradient(90deg, #2962ff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white z-50 transition-colors bg-black/20 hover:bg-black/50 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur">
            <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* --- LEFT SIDE: FORM --- */}
        <div className="w-full lg:w-[45%] p-8 md:p-12 flex flex-col justify-center relative z-10 bg-[#0b0e14]/95">
            {/* Logo Text Top Left */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <i className="fa-solid fa-dragon text-blue-500"></i>
                <span className="font-rajdhani font-bold text-white text-lg tracking-wider">Pogo.</span>
            </div>

            <div className="mt-8">
                {mode === 'login' && (
                    <>
                        <h2 className="text-4xl font-black text-white font-rajdhani uppercase tracking-wide mb-1 text-glow">Bem-vindo(a)</h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Não tem uma conta? <button onClick={() => setMode('signup')} className="text-blue-400 hover:text-white font-bold transition">Cadastre-se</button>
                        </p>

                        {error && (
                            <div className="bg-red-900/20 border-l-2 border-red-500 text-red-300 p-3 mb-4 text-xs flex items-center gap-2">
                                <i className="fa-solid fa-triangle-exclamation"></i> {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full bg-[#151a25] border border-slate-700 text-white p-4 rounded-xl focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] outline-none transition-all placeholder:text-slate-600"
                                        placeholder="treinador@exemplo.com"
                                        required
                                    />
                                    <i className="fa-solid fa-envelope absolute right-4 top-4 text-slate-600"></i>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Senha</label>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        className="w-full bg-[#151a25] border border-slate-700 text-white p-4 rounded-xl focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <i className="fa-solid fa-lock absolute right-4 top-4 text-slate-600"></i>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer hover:text-white transition">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe} 
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-0" 
                                    />
                                    Lembrar de mim
                                </label>
                                <button type="button" className="hover:text-blue-400 transition">Esqueceu a senha?</button>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn-tech btn-tech-blue mt-6"
                            >
                                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-right-to-bracket"></i>}
                                <span>{loading ? 'Entrando...' : 'Entrar na Conta'}</span>
                            </button>
                        </form>
                    </>
                )}

                {mode === 'signup' && (
                    <>
                        <h2 className="text-4xl font-black text-white font-rajdhani uppercase tracking-wide mb-1 text-glow">Criar Conta</h2>
                        <p className="text-slate-400 text-sm mb-8">
                            Já tem uma conta? <button onClick={() => setMode('login')} className="text-blue-400 hover:text-white font-bold transition">Fazer Login</button>
                        </p>
                        
                        {error && (
                            <div className="bg-red-900/20 border-l-2 border-red-500 text-red-300 p-3 mb-4 text-xs">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full bg-[#151a25] border border-slate-700 text-white p-4 rounded-xl focus:border-green-500 outline-none transition-all"
                                    placeholder="treinador@exemplo.com"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Senha</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="w-full bg-[#151a25] border border-slate-700 text-white p-4 rounded-xl focus:border-green-500 outline-none transition-all"
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn-tech btn-tech-green mt-6"
                            >
                                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-user-plus"></i>}
                                <span>{loading ? 'Processando...' : 'Registrar'}</span>
                            </button>
                        </form>
                    </>
                )}

                {mode === 'confirm' && (
                    <>
                        <h2 className="text-4xl font-black text-white font-rajdhani uppercase tracking-wide mb-1">Verificação</h2>
                        <p className="text-slate-400 text-sm mb-8">Insira o código enviado para {email}</p>
                        
                        {error && <div className="text-red-400 text-xs mb-4">{error}</div>}

                        <form onSubmit={handleConfirm} className="space-y-6">
                            <input 
                                type="text" 
                                value={code} 
                                onChange={(e) => setCode(e.target.value)} 
                                className="w-full bg-[#151a25] border border-yellow-600/50 text-yellow-400 p-4 text-center text-3xl font-mono tracking-[0.5em] rounded-xl focus:shadow-[0_0_20px_rgba(234,179,8,0.2)] outline-none"
                                maxLength={6}
                                placeholder="000000"
                                required 
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn-tech btn-tech-yellow mt-6"
                            >
                                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-check-double"></i>}
                                <span>{loading ? 'Verificando...' : 'Confirmar Código'}</span>
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>

        {/* --- RIGHT SIDE: ILLUSTRATION --- */}
        <div className="hidden lg:flex w-[55%] relative items-center justify-center bg-[#05060a] overflow-hidden">
            {/* Background Gradient/Mesh */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-[#0b0e14] to-[#0b0e14] z-0"></div>
            <div className="absolute inset-0 opacity-20 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')] z-0"></div>

            {/* Central Circle & Illustration */}
            <div className="relative z-10 flex items-center justify-center">
                {/* Glowing Circle */}
                <div className="w-[400px] h-[400px] bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(234,179,8,0.3)] relative overflow-hidden border-4 border-yellow-300/50">
                    {/* Inner texture */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://assets.pokemon.com/static2/_ui/img/global/bg_texture.png')]"></div>
                    
                    {/* Character Illustration */}
                    <img 
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" 
                        alt="Welcome" 
                        className="w-[350px] h-[350px] object-contain relative z-20 drop-shadow-2xl"
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
