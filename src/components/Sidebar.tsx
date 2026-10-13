import React from 'react';
import {
  LayoutDashboard,
  Tags,
  PlusCircle,
  Boxes,
  ShoppingCart,
  FileText,
  History,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Server,
  Package,
} from 'lucide-react';
import { User } from '../types';

export type NavigationTab =
  | 'dashboard'
  | 'products'
  | 'product_add'
  | 'stock'
  | 'sales'
  | 'report'
  | 'sales_history'
  | 'users'
  | 'settings'
  | 'xampp_docs';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  currentUser: User | null;
  businessName: string;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  businessName,
  onLogout,
  isOpen,
  onCloseMobile,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'products' as NavigationTab, label: 'Product Management', icon: Tags, adminOnly: false },
    { id: 'product_add' as NavigationTab, label: 'Add New Product', icon: PlusCircle, adminOnly: false },
    { id: 'stock' as NavigationTab, label: 'Stock Management', icon: Boxes, adminOnly: false },
    { id: 'sales' as NavigationTab, label: 'Record Sales', icon: ShoppingCart, adminOnly: false, badge: 'Daily' },
    { id: 'report' as NavigationTab, label: 'Daily Sales Report', icon: FileText, adminOnly: false },
    { id: 'sales_history' as NavigationTab, label: 'Sales History', icon: History, adminOnly: false },
    { id: 'users' as NavigationTab, label: 'User Management', icon: Users, adminOnly: true },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: SettingsIcon, adminOnly: true },
    { id: 'xampp_docs' as NavigationTab, label: 'XAMPP & PHP Source', icon: Server, adminOnly: false, badge: 'PHP/SQL' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate leading-tight tracking-tight">{businessName}</h1>
            <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider block">Retail Inventory</span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Navigation
          </div>

          {navItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="truncate flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User profile & Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="p-2.5 bg-slate-800/80 rounded-xl mb-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    currentUser?.role === 'admin' ? 'bg-purple-400' : 'bg-emerald-400'
                  }`}
                />
                <span className="text-[10px] text-slate-400 capitalize">{currentUser?.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition border border-rose-900/40 hover:border-rose-700/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
