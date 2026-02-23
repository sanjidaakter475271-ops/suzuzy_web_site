import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { User, Mail, Lock, Loader2, ArrowLeft, Zap, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface RegisterProps {
  onLogin: (name: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(
      formData.email,
      formData.password,
      formData.name,
    );

    if (authError) {
      setError(authError || "Registration failed");
      setLoading(false);
      return;
    }

    alert("Registration successful! Please ask an admin to authorize your service role.");
    navigate(RoutePath.LOGIN);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden relative selection:bg-blue-500 selection:text-white">

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[#0a0f1c]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl p-4 md:p-6"
      >
        <div className="relative bg-[#0d1326] border-0 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">

          <div className="p-8 md:p-12">
            <button
              onClick={() => navigate(RoutePath.LOGIN)}
              className="flex items-center text-slate-500 hover:text-blue-500 mb-8 transition-colors group text-xs font-bold uppercase tracking-widest font-display"
            >
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Login
            </button>

            <div className="mb-10 text-left">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-3xl font-bold text-white mb-3"
              >
                Create Profile
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-slate-400 font-medium tracking-tight text-sm"
              >
                Join the service network. Admin authorization required.
              </motion.p>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm overflow-hidden"
                  >
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p className="font-medium text-left">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-6 md:col-span-1">
                  <div className="group">
                    <label className="block text-xs font-bold text-blue-500 mb-2 uppercase tracking-wider font-display ml-1">
                      FULL NAME
                    </label>
                    <div className="relative transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={18} className={`transition-colors duration-300 ${focusedField === 'name' ? 'text-blue-500' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#131b2f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium text-sm"
                        placeholder="Technician Name"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-blue-500 mb-2 uppercase tracking-wider font-display ml-1">
                      WORK EMAIL
                    </label>
                    <div className="relative transition-all duration-300">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={18} className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-500' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#131b2f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium text-sm"
                        placeholder="staff@showroom.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 md:col-span-1">
                  <div className="group">
                    <label className="block text-xs font-bold text-blue-500 mb-2 uppercase tracking-wider font-display ml-1">
                      SECURE PASSCODE
                    </label>
                    <div className={`relative transition-all duration-300`}>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-500' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#131b2f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium text-sm tracking-widest"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold text-blue-500 mb-2 uppercase tracking-wider font-display ml-1">
                      CONFIRM PASSCODE
                    </label>
                    <div className={`relative transition-all duration-300`}>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className={`transition-colors duration-300 ${focusedField === 'confirm' ? 'text-blue-500' : 'text-slate-500'}`} />
                      </div>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onFocus={() => setFocusedField('confirm')}
                        onBlur={() => setFocusedField(null)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-[#131b2f] border border-[#1e293b] rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium text-sm tracking-widest"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center">
                <div className="flex items-start space-x-3 text-slate-400 text-xs mb-8 bg-[#131b2f] p-4 rounded-2xl border border-[#1e293b] w-full">
                  <div className="mt-0.5 flex-shrink-0"><CheckCircle2 size={16} className="text-blue-500" /></div>
                  <p className="font-medium leading-relaxed">By registering, you agree to the workshop safety protocols and data privacy guidelines. Access will be reviewed by system administrators.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-[90%] relative overflow-hidden bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-[1.2rem] shadow-[0_8px_30px_rgb(59,130,246,0.2)] active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span className="mr-2 font-display tracking-widest text-[13px] uppercase font-bold">COMPLETE REGISTRATION</span>
                        <Zap size={16} className="text-white fill-current" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>

          {/* Footer Info */}
          <div className="px-8 py-4 bg-[#0a0f1c] border-t border-[#1e293b] flex justify-between items-center text-[10px] text-slate-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="font-bold uppercase tracking-widest">Protocol V3 Secure</span>
            </div>
            <span className="font-mono">ENCRYPTED SESSION</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};