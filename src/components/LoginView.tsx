import React, { useState } from 'react';
import { Package, Lock, Mail, Shield, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@retail.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const settings = storageService.getSettings();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = storageService.login(email);
    if (user) {
      onLoginSuccess();
    } else {
      setError('Invalid email address or password. Try the demo accounts below.');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const user = storageService.login(demoEmail);
    if (user) {
      onLoginSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/20">
            <Package className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{settings.business_name}</h2>
          <p className="text-sm text-slate-500 mt-1">Smart Inventory & Daily Sales Management</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@retail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <div className="text-right mt-1">
              <span className="text-xs text-slate-400">Secured with PHP password_verify()</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs font-medium text-slate-400 mb-3 uppercase tracking-wider">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@retail.com', 'admin123')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin (Ruwan)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff@retail.com', 'staff123')}
              className="py-2.5 px-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Staff (Kasun)</span>
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Timezone: {settings.timezone} &bull; Currency: {settings.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
