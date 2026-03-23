import { useEffect, useMemo, useState } from 'react';
import { User, Phone, Lock, Save, Shield, UserCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';

export const AdminProfile = () => {
  const { t, currentUser, updateMyProfile } = useApp();

  const initial = useMemo(() => ({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
  }), [currentUser?.name, currentUser?.phone]);

  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<'ok' | 'local' | ''>('');

  useEffect(() => {
    setName(initial.name);
    setPhone(initial.phone);
  }, [initial.name, initial.phone]);

  const canSave = name.trim().length > 0 && phone.trim().length > 0 && !saving;

  const handleSave = async () => {
    setError('');
    setSaved('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) { setError(t('admin.profile.validation.name')); return; }
    if (!cleanPhone) { setError(t('admin.profile.validation.phone')); return; }

    setSaving(true);
    try {
      const ok = await updateMyProfile({ name: cleanName, phone: cleanPhone, password: password.trim() || undefined });
      setPassword('');
      setSaved(ok ? 'ok' : 'local');
      setTimeout(() => setSaved(''), 2200);
    } catch {
      setError(t('admin.profile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 text-sm text-gray-600 dark:text-gray-300">
            {t('admin.profile.needLogin')}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCircle2 size={20} className="text-[#2563EB] dark:text-blue-400 flex-shrink-0" />
              <span className="truncate">{t('admin.profile.title')}</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('admin.profile.subtitle')}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? t('admin.profile.saving') : t('admin.profile.save')}
          </button>
        </div>

        {(error || saved) && (
          <div className={`rounded-2xl border p-4 text-sm ${
            error
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300'
              : saved === 'ok'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200'
          }`}>
            {error || (saved === 'ok' ? t('admin.profile.savedOk') : t('admin.profile.savedLocal'))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Account */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <User size={16} className="text-[#2563EB] dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 dark:text-white">{t('admin.profile.account')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('admin.profile.accountHint')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  {t('common.name')}
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB]"
                  placeholder={t('admin.profile.namePlaceholder')}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  {t('common.phone')}
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder="+998901234567"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Shield size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 dark:text-white">{t('admin.profile.security')}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">{t('admin.profile.securityHint')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  {t('admin.profile.newPassword')}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB]"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t('admin.profile.passwordHint')}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 p-3">
                <div className="text-xs text-gray-500 dark:text-gray-300">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{t('admin.profile.role')}:</span>{' '}
                  {t(`login.role.${currentUser.role}` as any)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

