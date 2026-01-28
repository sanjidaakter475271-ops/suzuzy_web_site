import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { KeyRound, Mail, Loader2, ArrowRight, ShieldCheck, Zap, Fingerprint, AlertCircle } from 'lucide-react';
import { authClient } from '../lib/auth-client';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    // Check if biometrics was enabled in settings
    const bioEnabled = localStorage.getItem('service_biometrics_enabled') === 'true';
    if (bioEnabled && window.PublicKeyCredential) {
      setHasBiometrics(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Invalid credentials");
      setLoading(false);
      return;
    }

    if (data?.user) {
      const userRole = (data.user as any).role;
      const allowedRoles = ['super_admin', 'service_admin', 'service_technician', 'service_sales_admin'];

      if (!allowedRoles.includes(userRole)) {
        await authClient.signOut();
        setError("Access denied: Service Personnel Only.");
        setLoading(false);
        return;
      }

      onLogin(data.user.name);
      navigate(RoutePath.DASHBOARD);
    }
    setLoading(false);
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname, // Defaults to current domain
          userVerification: "required",
        }
      });

      if (assertion) {
        // Successful biometric verification
        setTimeout(() => {
          onLogin("Service Staff (Bio)");
          navigate(RoutePath.DASHBOARD);
          setLoading(false);
        }, 500);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Biometric login error:", err);
      // alert("Biometric verification failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white overflow-hidden relative selection:bg-blue-500 selection:text-white">

      {/* Background Gradients & Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
      </div>

      {/* Left Panel: Visual/Brand (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 border-r border-white/5 bg-slate-900/30 backdrop-blur-sm">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={18} className="text-white fill-current" />
            </div>
            <span className="font-display font-bold text-2xl tracking-wide text-white">SERVICEMATE</span>
          </div>
        </div>

        <div className="space-y-6 max-w-lg">
          <h1 className="font-display text-5xl font-bold leading-tight bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent">
            Precision Service Management.
          </h1>
          <p className="text-slate-400 text-lg font-light leading-relaxed">
            Access the showroom diagnostics dashboard. Manage workflows, track repairs, and consult AI mechanics in real-time.
          </p>

          <div className="flex space-x-4 pt-4">
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Secure Environment</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <Zap size={16} className="text-amber-400" />
              <span className="text-xs font-medium text-slate-300">AI Powered</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          SYSTEM VERSION 2.4.0 // CONNECTED
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 relative z-10">

        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Zap size={24} className="text-white fill-current" />
              </div>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Identify yourself to access the network.</p>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-shake">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-5 animate-slide-up-delay">
              <div className="group">
                <label className="block text-xs font-medium text-blue-400 mb-2 uppercase tracking-wider font-display">
                  Access ID / Email
                </label>
                <div className={`relative transition-all duration-300 transform ${focusedField === 'email' ? 'scale-[1.02]' : 'scale-100'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-900 transition-all outline-none"
                    placeholder="staff@showroom.com"
                  />
                </div>
              </div>

              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-medium text-blue-400 uppercase tracking-wider font-display">
                    Passcode
                  </label>
                  <button type="button" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">
                    Forgot code?
                  </button>
                </div>
                <div className={`relative transition-all duration-300 transform ${focusedField === 'password' ? 'scale-[1.02]' : 'scale-100'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound size={20} className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-900 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 animate-slide-up-delay-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-600/20 transform transition-all active:scale-[0.98]"
              >
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative flex items-center justify-center">
                  {loading && !hasBiometrics ? ( // Show loader here only if biometrics isn't interfering
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span className="mr-2 font-display tracking-wide text-lg">INITIALIZE SESSION</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {hasBiometrics && (
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={loading}
                  className="w-full relative group overflow-hidden bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 px-4 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Fingerprint size={20} className="mr-2 text-emerald-400" />
                      <span className="font-display tracking-wide">BIOMETRIC AUTH</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>

          <div className="mt-8 text-center animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-slate-500">
              New staff member?{' '}
              <button
                onClick={() => navigate(RoutePath.REGISTER)}
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Register Access
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};