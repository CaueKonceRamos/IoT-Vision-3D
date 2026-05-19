import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from '@/stores/toastStore';
import type { UserRole } from '@/types';

const features = [
  'Circuitos 2D e ambientes 3D',
  'Simulacao em tempo real',
  'Turmas e atividades educacionais',
  'Biblioteca de componentes IoT',
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname === '/register';
  const [tab, setTab] = useState<'login' | 'register'>(isRegister ? 'register' : 'login');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('aluno');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const { login, register } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoginLoading(true);
    const success = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (success) {
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      toast.error('Preencha todos os campos');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('As senhas nao coincidem');
      return;
    }
    if (regPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    setRegLoading(true);
    const success = await register(regName, regEmail, regPassword, regRole);
    setRegLoading(false);
    if (success) {
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    }
  };

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/\d/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthColors = ['#ff4444', '#ffaa00', '#00d4ff', '#00ff88'];
  const strengthLabels = ['Fraca', 'Razoavel', 'Boa', 'Forte'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0a0a0a] items-center">
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(0,115,230,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,115,230,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center bottom',
          animation: 'gridScroll 8s linear infinite',
        }} />

        {/* Floating Shapes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-sm opacity-10"
            style={{
              width: 8 + Math.random() * 16,
              height: 8 + Math.random() * 16,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              backgroundColor: i % 2 === 0 ? '#0073e6' : '#00d4ff',
              animation: `float${i} ${15 + Math.random() * 15}s ease-in-out infinite`,
            }}
          />
        ))}

        <div className="relative z-10 px-16">
          <h2 className="text-[#f0f0f0] text-2xl font-normal tracking-tight mb-1">Voltix <span className="text-[11px] uppercase tracking-wider text-[#0073e6]">3D</span></h2>
          <p className="text-xl lg:text-2xl text-[#e1e1e1] font-normal leading-relaxed max-w-[360px] mt-12" style={{ letterSpacing: '-0.4px' }}>
            Laboratorio virtual para criar, simular e aprender IoT.
          </p>
          <div className="mt-10 space-y-4">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span className="text-sm text-white/50 font-light">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes gridScroll {
            0% { background-position: 0 0; }
            100% { background-position: 0 40px; }
          }
          ${[...Array(6)].map((_, i) => `
            @keyframes float${i} {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              25% { transform: translate(${20 + Math.random() * 20}px, -${10 + Math.random() * 20}px) rotate(${Math.random() * 90}deg); }
              50% { transform: translate(-${10 + Math.random() * 20}px, ${15 + Math.random() * 20}px) rotate(${Math.random() * 180}deg); }
              75% { transform: translate(${15 + Math.random() * 10}px, ${10 + Math.random() * 10}px) rotate(${Math.random() * 270}deg); }
            }
          `).join('')}
        `}</style>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-[420px] bg-[#121212] border border-white/[0.08] rounded-xl p-8 lg:p-12">
          {/* Tabs */}
          <div className="flex mb-8">
            <button
              onClick={() => { setTab('login'); navigate('/login'); }}
              className={`flex-1 pb-3 text-sm font-normal text-center transition-all border-b-2 ${
                tab === 'login' ? 'text-[#f0f0f0] border-[#0073e6]' : 'text-white/50 border-transparent hover:text-[#e1e1e1]'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab('register'); navigate('/register'); }}
              className={`flex-1 pb-3 text-sm font-normal text-center transition-all border-b-2 ${
                tab === 'register' ? 'text-[#f0f0f0] border-[#0073e6]' : 'text-white/50 border-transparent hover:text-[#e1e1e1]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <p className="text-[#f0f0f0] text-2xl font-normal tracking-tight">Bem-vindo de volta</p>
                <p className="text-sm text-white/50 font-light mt-1">Entre na sua conta para continuar</p>
              </div>

              <div>
                <label className="label-text block mb-2">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
              </div>

              <div>
                <label className="label-text block mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border border-white/[0.08] bg-white/5 accent-[#0073e6]" />
                  <span className="text-[13px] text-white/50">Lembrar-me</span>
                </label>
                <button type="button" className="text-[13px] text-[#0073e6] hover:underline">Esqueceu a senha?</button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-[#0073e6] text-[#0a0a0a] py-3.5 rounded-lg text-base font-normal hover:bg-[#005bb5] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                ) : (
                  'Entrar'
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
                <div className="relative flex justify-center"><span className="bg-[#121212] px-4 text-xs text-white/50">ou</span></div>
              </div>

              <div className="space-y-3">
                <button type="button" className="w-full btn-secondary flex items-center justify-center gap-3 py-3 rounded-lg text-sm">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continuar com Google
                </button>
                <button type="button" className="w-full btn-secondary flex items-center justify-center gap-3 py-3 rounded-lg text-sm">
                  <GithubIcon />
                  Continuar com GitHub
                </button>
              </div>

              <p className="text-center text-sm text-white/50 mt-4">
                Nao tem uma conta?{' '}
                <button type="button" onClick={() => { setTab('register'); navigate('/register'); }} className="text-[#0073e6] hover:underline">Criar conta</button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <p className="text-[#f0f0f0] text-2xl font-normal tracking-tight">Criar Conta</p>
                <p className="text-sm text-white/50 font-light mt-1">Junte-se a comunidade Voltix</p>
              </div>

              <div>
                <label className="label-text block mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Joao da Silva"
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
              </div>

              <div>
                <label className="label-text block mb-2">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
              </div>

              <div>
                <label className="label-text block mb-2">Eu sou...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegRole('professor')}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      regRole === 'professor'
                        ? 'border-[#0073e6] bg-[#0073e6]/15'
                        : 'border-white/[0.08] bg-white/5 hover:border-white/[0.14]'
                    }`}
                  >
                    <GraduationCapIcon />
                    <p className="text-sm text-[#f0f0f0] mt-2">Professor</p>
                    <p className="text-xs text-white/50 mt-0.5">Criar turmas e atividades</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('aluno')}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      regRole === 'aluno'
                        ? 'border-[#0073e6] bg-[#0073e6]/15'
                        : 'border-white/[0.08] bg-white/5 hover:border-white/[0.14]'
                    }`}
                  >
                    <BookIcon />
                    <p className="text-sm text-[#f0f0f0] mt-2">Aluno</p>
                    <p className="text-xs text-white/50 mt-0.5">Participar de turmas e projetos</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="label-text block mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {regPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex-1 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              backgroundColor: i < getPasswordStrength(regPassword) ? strengthColors[getPasswordStrength(regPassword) - 1] : 'transparent',
                              width: i < getPasswordStrength(regPassword) ? '100%' : '0%',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: strengthColors[getPasswordStrength(regPassword) - 1] }}>
                      Forca: {strengthLabels[getPasswordStrength(regPassword) - 1]}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="label-text block mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-[#f0f0f0] placeholder:text-white/40 focus:border-[#0073e6] focus:ring-[3px] focus:ring-[#0073e6]/15 outline-none transition-all"
                />
                {regConfirm && regPassword !== regConfirm && (
                  <p className="text-xs text-[#ff4444] mt-1">As senhas nao coincidem</p>
                )}
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border border-white/[0.08] bg-white/5 accent-[#0073e6] mt-0.5" />
                <span className="text-[13px] text-white/50 leading-relaxed">
                  Concordo com os <span className="text-[#0073e6]">Termos de Uso</span> e <span className="text-[#0073e6]">Politica de Privacidade</span>
                </span>
              </label>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full bg-[#0073e6] text-[#0a0a0a] py-3.5 rounded-lg text-base font-normal hover:bg-[#005bb5] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {regLoading ? (
                  <div className="w-5 h-5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                ) : (
                  'Criar Conta'
                )}
              </button>

              <p className="text-center text-sm text-white/50 mt-4">
                Ja tem uma conta?{' '}
                <button type="button" onClick={() => { setTab('login'); navigate('/login'); }} className="text-[#0073e6] hover:underline">Entrar</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function GithubIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg className="w-6 h-6 mx-auto text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5"/>
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-6 h-6 mx-auto text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
