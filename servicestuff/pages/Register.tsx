import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import { User, Mail, Lock, Loader2, ArrowLeft, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { authClient } from '../lib/auth-client';

interface RegisterProps {
  onLogin: (name: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ onLogin }) => {
  const navigate = useNavigate();
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
    const { data, error: authError } = await authClient.signUp.email({
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });

    if (authError) {
      setError(authError.message || "Registration failed");
      setLoading(false);
      return;
    }

    if (data?.user) {
      // Note: User will need to be assigned a 'service' role by an admin to log into this app
      alert("Registration successful! Please ask an admin to authorize your service role.");
      navigate(RoutePath.LOGIN);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white overflow-hidden relative selection:bg-indigo-500 selection:text-white">

      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/20 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
      </div>

      <div className="w-full flex flex-col items-center justify-center p-6 relative z-10">

        <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl animate-slide-up">

          <button
            onClick={() => navigate(RoutePath.LOGIN)}
            className="flex items-center text-slate-500 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Return to Login</span>
          </button>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-white mb-3">Create Profile</h1>
            <p className="text-slate-400">Join the service network. Authorization required.</p>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">

              <div className="group">
                <label className="block text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wider font-display">
                  Full Name
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.01]' : 'scale-100'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={20} className={`transition-colors duration-300 ${focusedField === 'name' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-800 transition-all outline-none"
                    placeholder="Technician Name"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wider font-display">
                  Email
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : 'scale-100'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={20} className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-800 transition-all outline-none"
                    placeholder="staff@showroom.com"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wider font-display">
                  Password
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.01]' : 'scale-100'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-800 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-medium text-indigo-400 mb-2 uppercase tracking-wider font-display">
                  Confirm Password
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.01]' : 'scale-100'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={20} className={`transition-colors duration-300 ${focusedField === 'confirmPassword' ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-slate-800 transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-start space-x-3 text-slate-400 text-xs mb-6">
                <div className="mt-0.5"><CheckCircle2 size={14} className="text-emerald-500" /></div>
                <p>By registering, you agree to the workshop safety protocols and data privacy guidelines.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-white text-slate-900 hover:bg-slate-100 font-bold py-4 px-4 rounded-xl shadow-lg shadow-white/10 transform transition-all active:scale-[0.98]"
              >
                <div className="absolute inset-0 w-full h-full bg-indigo-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                <div className="relative flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="animate-spin text-slate-900" size={20} />
                  ) : (
                    <>
                      <span className="mr-2 font-display tracking-wide text-lg">COMPLETE REGISTRATION</span>
                      <Zap size={20} className="text-indigo-600 fill-current" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};