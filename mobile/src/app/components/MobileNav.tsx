import { useLocation, useNavigate } from 'react-router';
import { Home, Users, ShoppingBag, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  path: string;
  icon: React.ElementType;
  labelKey: 'common.dashboard' | 'common.clients' | 'common.orders' | 'common.profile';
}

const agentNavItems: NavItem[] = [
  { path: '/agent', icon: Home, labelKey: 'common.dashboard' },
  { path: '/agent/clients', icon: Users, labelKey: 'common.clients' },
  { path: '/agent/orders', icon: ShoppingBag, labelKey: 'common.orders' },
];

const deliveryNavItems: NavItem[] = [
  { path: '/delivery', icon: Home, labelKey: 'common.dashboard' },
  { path: '/delivery/orders', icon: ShoppingBag, labelKey: 'common.orders' },
  { path: '/delivery/profile', icon: User, labelKey: 'common.profile' },
];

interface MobileNavProps {
  role: 'agent' | 'delivery';
}

export const MobileNav = ({ role }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useApp();
  const items = role === 'agent' ? agentNavItems : deliveryNavItems;

  const isActive = (path: string) => {
    if (path === '/agent' || path === '/delivery') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-2 py-2 flex items-center justify-around safe-area-inset-bottom transition-colors duration-300">
      {items.map(item => {
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? 'text-[#2563EB] dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${active ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium leading-none ${active ? 'font-semibold' : ''}`}>{t(item.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
};
