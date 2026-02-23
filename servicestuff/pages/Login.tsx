import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { KeyRound, Mail, Loader2, ArrowRight, ShieldCheck, Zap, Fingerprint, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { signIn, signOut, user: authUser } = useAuth();
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

  useEffect(() => {
    if (authUser) {
      const allowedRoles = ['super_admin', 'service_admin', 'service_technician', 'service_sales_admin'];
      if (!allowedRoles.includes(authUser.role)) {
        signOut();
        setError("Access denied: Service Personnel Only.");
        setLoading(false);
      } else {
        onLogin(authUser.name);
        navigate(RoutePath.DASHBOARD);
        setLoading(false);
      }
    }
  }, [authUser, navigate, onLogin, signOut]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError || "Invalid credentials");
      setLoading(false);
      return;
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          userVerification: "required",
        }
      });

      if (assertion) {
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden relative selection:bg-blue-500 selection:text-white">

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#0a0f1c]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg p-4 md:p-6"
      >
        <div className="relative bg-[#0d1326] border-0 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">

          <div className="p-8 md:p-12">
            <div className="mb-10 text-center flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-[1.2rem] shadow-xl shadow-blue-500/20 mb-6"
              >
                <Zap size={32} className="text-white fill-current" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-3xl font-bold text-white mb-2"
              >
                Welcome Back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-400 font-medium tracking-tight text-sm"
              >
                Identify yourself to access the network.
              </motion.p>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm overflow-hidden"
                  >
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p className="font-medium text-left">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-xs font-bold text-blue-500 mb-2 uppercase tracking-wider font-display ml-1">
                      ACCESS ID / EMAIL
                    </label>
                    <div className={`relative transition-all duration-300 group`}>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={18} className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#131b2f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium text-sm"
                        placeholder="staff@showroom.com"
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex justify-between items-center mb-2 mx-1">
                      <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider font-display">
                        PASSCODE
                      </label>
                      <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-blue-400 uppercase tracking-widest transition-colors font-display">
                        FORGOT?
                      </button>
                    </div>
                    <div className={`relative transition-all duration-300 group`}>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <KeyRound size={18} className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#131b2f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium text-sm tracking-widest"
                        placeholder="••••••••"
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4 pt-2 flex flex-col items-center"
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-[90%] relative overflow-hidden bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-[1.2rem] shadow-[0_8px_30px_rgb(59,130,246,0.2)] active:scale-[0.98] transition-all"
                  >
                    <div className="relative flex items-center justify-center">
                      {loading && !hasBiometrics ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <span className="mr-2 font-display tracking-widest text-[13px] uppercase font-bold">INITIALIZE SESSION</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </div>
                  </button>

                  {hasBiometrics && (
                    <button
                      type="button"
                      onClick={handleBiometricLogin}
                      disabled={loading}
                      className="w-[90%] relative group bg-[#131b2f] hover:bg-[#1e293b] border border-[#1e293b] text-white font-bold py-3.5 px-4 rounded-[1.2rem] shadow-sm active:scale-[0.98] transition-all flex items-center justify-center"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                          <Fingerprint size={16} className="mr-2 text-blue-500" />
                          <span className="font-display tracking-widest text-[13px] uppercase font-bold">BIOMETRIC AUTH</span>
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              </form>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-10 text-center"
              >
                <p className="text-sm font-medium text-slate-500">
                  New staff member?{' '}
                  <button
                    onClick={() => navigate(RoutePath.REGISTER)}
                    className="font-bold text-blue-500 hover:text-blue-400 decoration-2 transition-all"
                  >
                    Register Access
                  </button>
                </p>
              </motion.div>
            </div>

          </div>

          {/* Footer Info */}
          <div className="px-8 py-4 bg-[#0a0f1c] border-t border-[#1e293b] flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Network</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">v2.4.0</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};