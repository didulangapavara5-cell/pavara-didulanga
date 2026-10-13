import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { ProductManagementView } from './components/ProductManagementView';
import { AddProductModal } from './components/AddProductModal';
import { StockManagementView } from './components/StockManagementView';
import { RecordSalesView } from './components/RecordSalesView';
import { DailyReportView } from './components/DailyReportView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { XamppDocsView } from './components/XamppDocsView';
import { storageService, DEFAULT_SETTINGS } from './services/storageService';
import { User, Settings } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(storageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(storageService.getSettings());
  const [allUsers, setAllUsers] = useState<User[]>(storageService.getUsers());
  const [restockProductId, setRestockProductId] = useState<number | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync state with storage
  useEffect(() => {
    setCurrentUser(storageService.getCurrentUser());
    setSettings(storageService.getSettings());
    setAllUsers(storageService.getUsers());
  }, [refreshTrigger]);

  const handleLoginSuccess = () => {
    setCurrentUser(storageService.getCurrentUser());
    setCurrentTab('dashboard');
    setRefreshTrigger(t => t + 1);
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
  };

  const handleSwitchUser = (userId: number) => {
    const switched = storageService.switchUser(userId);
    if (switched) {
      setCurrentUser(switched);
      setRefreshTrigger(t => t + 1);
    }
  };

  const handleResetData = () => {
    if (confirm('Reset catalog, stock, and sales to default demo values?')) {
      storageService.resetDefaults();
      setCurrentUser(storageService.getCurrentUser());
      setSettings(storageService.getSettings());
      setAllUsers(storageService.getUsers());
      setRefreshTrigger(t => t + 1);
    }
  };

  const handleRestockProduct = (productId: number) => {
    setRestockProductId(productId);
    setCurrentTab('stock');
  };

  const handleTabSelect = (tab: NavigationTab) => {
    if (tab === 'product_add') {
      setIsAddProductModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  // If not logged in, render secure Login view
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'products':
        return 'Product Management';
      case 'product_add':
        return 'Add New Product';
      case 'stock':
        return 'Stock Management';
      case 'sales':
        return 'Record Daily Sales';
      case 'report':
        return 'Daily Sales & Stock Report';
      case 'sales_history':
        return 'Sales History';
      case 'users':
        return 'User Management';
      case 'settings':
        return 'Business Settings';
      case 'xampp_docs':
        return 'XAMPP & PHP Source Code';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabSelect}
        currentUser={currentUser}
        businessName={settings.business_name}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <TopNavbar
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          allUsers={allUsers}
          pageTitle={getPageTitle()}
          settings={settings}
          onResetData={handleResetData}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              onRestockProduct={handleRestockProduct}
              settings={settings}
            />
          )}

          {currentTab === 'products' && (
            <ProductManagementView
              onOpenRestock={handleRestockProduct}
              settings={settings}
            />
          )}

          {currentTab === 'stock' && (
            <StockManagementView
              initialProductId={restockProductId}
              settings={settings}
            />
          )}

          {currentTab === 'sales' && (
            <RecordSalesView
              settings={settings}
              onViewReport={() => setCurrentTab('report')}
            />
          )}

          {currentTab === 'report' && <DailyReportView settings={settings} />}

          {currentTab === 'sales_history' && (
            <SalesHistoryView
              settings={settings}
              onOpenReportForDate={() => setCurrentTab('report')}
            />
          )}

          {currentTab === 'users' && <UserManagementView />}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              onResetData={handleResetData}
            />
          )}

          {currentTab === 'xampp_docs' && <XamppDocsView />}
        </main>

        {/* Global Footer (hidden on print) */}
        <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-xs text-slate-400 no-print">
          &copy; {new Date().getFullYear()} {settings.business_name}. Smart Inventory &amp; Daily Sales Management System.
        </footer>
      </div>

      {/* Add Product Modal (accessible from navigation or shortcuts) */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductCreated={() => {
          setRefreshTrigger(t => t + 1);
          setCurrentTab('products');
        }}
        currency={settings.currency}
      />
    </div>
  );
}
