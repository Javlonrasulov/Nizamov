import { ReactNode, useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, Package, ShoppingBag, UserCog,
  BarChart2, LogOut, Globe, ChevronLeft, Menu, X, Sun, Moon, GripVertical,
  Warehouse, Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language, languageLabels } from '../i18n/translations';
import { AdminDateFilter } from './AdminDateFilter';

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard' as const },
  { path: '/admin/agents', icon: BarChart2, labelKey: 'admin.agentStats' as const },
  { path: '/admin/orders', icon: ShoppingBag, labelKey: 'admin.ordersPage' as const },
  { path: '/admin/clients', icon: Users, labelKey: 'admin.clientsPage' as const },
  { path: '/admin/products', icon: Package, labelKey: 'admin.productsPage' as const },
  { path: '/admin/suppliers', icon: Truck, labelKey: 'admin.suppliers' as const },
  { path: '/admin/agents-mgmt', icon: UserCog, labelKey: 'admin.agentsPage' as const },
  { path: '/admin/reports', icon: BarChart2, labelKey: 'admin.reportsPage' as const },
  { path: '/admin/warehouse', icon: Warehouse, labelKey: 'admin.warehouse' as const },
];

const MIN_WIDTH = 64;
const MAX_WIDTH = 320;
const COLLAPSE_THRESHOLD = 90;
const DEFAULT_WIDTH = 224;

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { t, lang, setLang, currentUser, logout, theme, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sidebar width state
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(DEFAULT_WIDTH);

  const collapsed = sidebarWidth <= COLLAPSE_THRESHOLD;

  const langs: Language[] = ['uz_lat', 'uz_kir', 'ru'];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Resize handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartX.current = e.clientX;
    resizeStartWidth.current = sidebarWidth;
    setIsResizing(true);
  }, [sidebarWidth]);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizeStartX.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStartWidth.current + delta));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = (e: MouseEvent) => {
      setIsResizing(false);
      // Snap: if below threshold, fully collapse
      const delta = e.clientX - resizeStartX.current;
      const newWidth = resizeStartWidth.current + delta;
      if (newWidth < COLLAPSE_THRESHOLD) {
        setSidebarWidth(MIN_WIDTH);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  const toggleCollapse = () => {
    setSidebarWidth(prev => prev <= COLLAPSE_THRESHOLD ? DEFAULT_WIDTH : MIN_WIDTH);
  };

  const SidebarContent = ({ isDesktop = false }: { isDesktop?: boolean }) => (
    <div className="flex flex-col h-full relative">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-700 ${collapsed && isDesktop ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        {(!collapsed || !isDesktop) && (
          <div className="min-w-0 overflow-hidden">
            <div className="font-bold text-gray-900 dark:text-white text-sm truncate">CRM</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all text-left ${
                active
                  ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-200'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              } ${collapsed && isDesktop ? 'justify-center' : ''}`}
              title={collapsed && isDesktop ? t(item.labelKey) : undefined}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0" />
              {(!collapsed || !isDesktop) && (
                <span className="text-sm font-medium truncate">{t(item.labelKey)}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User + Actions */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-3">
        {/* Collapse toggle button */}
        {isDesktop && (
          <button
            onClick={toggleCollapse}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm mb-1 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? t('common.expand') : t('common.collapse')}
          >
            <ChevronLeft size={16} className={`flex-shrink-0 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
            {!collapsed && <span>{t('common.collapse')}</span>}
          </button>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm ${collapsed && isDesktop ? 'justify-center' : ''}`}
          title={collapsed && isDesktop ? t('common.logout') : undefined}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {(!collapsed || !isDesktop) && t('common.logout')}
        </button>
      </div>

      {/* Width indicator (shows while resizing) */}
      {isDesktop && isResizing && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded-lg tabular-nums pointer-events-none z-50">
          {sidebarWidth}px
        </div>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] dark:bg-gray-900 flex transition-colors duration-300"
      style={{ fontFamily: 'Inter, sans-serif', userSelect: isResizing ? 'none' : undefined }}
    >
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 relative flex-shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ width: sidebarWidth, transition: isResizing ? 'none' : 'width 0.2s ease' }}
      >
        <SidebarContent isDesktop />

        {/* Drag resize handle */}
        <div
          onMouseDown={onMouseDown}
          className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize group z-20 flex items-center justify-center hover:bg-blue-400/20 transition-colors ${isResizing ? 'bg-blue-400/30' : ''}`}
          title="Kenglikni o'zgartirish"
        >
          <div className={`w-0.5 h-12 rounded-full transition-all ${isResizing ? 'bg-blue-500 opacity-100' : 'bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100'}`} />
        </div>

        {/* Collapse toggle button on sidebar edge - REMOVED */}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-white dark:bg-gray-800 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileOpen
                ? <X size={18} className="text-gray-600 dark:text-gray-300" />
                : <Menu size={18} className="text-gray-600 dark:text-gray-300" />}
            </button>
            {/* Date Filter */}
            <AdminDateFilter />
          </div>

          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark'
                ? <Sun size={16} className="text-yellow-400" />
                : <Moon size={16} className="text-gray-500" />}
            </button>

            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Globe size={14} />
                <span>{languageLabels[lang]}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden min-w-[180px]">
                  {langs.map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${lang === l ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {languageLabels[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};