import React from 'react';
import { Menu, ShieldCheck, UserCheck, Clock, RefreshCw } from 'lucide-react';
import { User, Settings } from '../types';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  currentUser: User | null;
  onSwitchUser: (userId: number) => void;
  allUsers: User[];
  pageTitle: string;
  settings: Settings;
  onResetData: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  currentUser,
  onSwitchUser,
  allUsers,
  pageTitle,
  settings,
  onResetData,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 no-print">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base font-bold text-slate-800 leading-tight">{pageTitle}</h2>
          <span className="text-xs text-slate-400 hidden sm:inline-block">
            {settings.business_name} &bull; Timezone: {settings.timezone}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Reset Demo Data quick button */}
        <button
          onClick={onResetData}
          title="Reset database to initial demo values"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>

        {/* Currency badge */}
        <div className="hidden sm:flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
          <span>{settings.currency} (LKR)</span>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 pl-2 hidden sm:inline">Role:</span>
          {allUsers.map(user => {
            const isSelected = currentUser?.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => onSwitchUser(user.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? user.role === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title={`Switch to ${user.name} (${user.role})`}
              >
                {user.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span className="capitalize">{user.role}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
