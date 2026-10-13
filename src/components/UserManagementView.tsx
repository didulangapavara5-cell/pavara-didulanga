import React, { useState } from 'react';
import { Users, Plus, Shield, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { User as UserType } from '../types';

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>(storageService.getUsers());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentUser = storageService.getCurrentUser();

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Name and email are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErrorMsg('A user with this email address already exists.');
      return;
    }

    storageService.addUser(name.trim(), email.trim(), role);
    setUsers(storageService.getUsers());
    setSuccessMsg(`User '${name.trim()}' created with role '${role}'.`);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleToggleStatus = (userId: number) => {
    if (userId === currentUser?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }
    storageService.toggleUserActive(userId);
    setUsers(storageService.getUsers());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Management (Admin Only)</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-based access permissions, staff accounts, and credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User List Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Registered Accounts</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{users.length} Total Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{u.name}</span>
                            {isCurrent && (
                              <span className="ml-1.5 px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded text-[9px] font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role === 'admin' ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span>{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.is_active !== false ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[10px] font-bold">
                            <XCircle className="w-3 h-3" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent ? (
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              u.is_active !== false
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {u.is_active !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Active Session</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Form */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Create New Staff Account</span>
          </h3>

          {successMsg && (
            <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Dilanga Pavara"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="dilanga@retail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">PHP password_hash(PASSWORD_BCRYPT)</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role Permission</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="staff">Staff (Sales Entry & Stock View)</option>
                <option value="admin">Administrator (Full Control)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
