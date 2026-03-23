import { useNavigate } from 'react-router';
import { Phone, LogOut, Package, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';

export const DeliveryProfile = () => {
  const { t, currentUser, orders, logout } = useApp();
  const navigate = useNavigate();

  const myOrders = orders.filter(o => o.deliveryId === currentUser?.id);
  const delivered = myOrders.filter(o => o.status === 'delivered').length;
  const active = myOrders.filter(o => o.status === 'delivering' || o.status === 'accepted').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <MobileShell>
      <MobileHeader title={t('common.profile')} showLang />
      <MobileContent className="pb-20">
        <div className="p-4 space-y-4">
          {/* Profile card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold">{currentUser?.name.charAt(0)}</span>
            </div>
            <h2 className="font-bold text-lg">{currentUser?.name}</h2>
            <p className="text-purple-200 text-sm mt-0.5">{t('login.role.delivery')}</p>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-purple-200 text-sm">
              <Phone size={13} />
              {currentUser?.phone}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-2">
                <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{delivered}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('delivery.delivered')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-2">
                <Package size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{active}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('delivery.stat.active')}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-red-200 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            {t('common.logout')}
          </button>
        </div>
      </MobileContent>
      <MobileNav role="delivery" />
    </MobileShell>
  );
};
