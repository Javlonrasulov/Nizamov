import { useState, useEffect } from 'react';
import { Plus, Phone, TrendingUp, CalendarDays, Edit2, Truck, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from '../../components/AdminLayout';
import { users } from '../../data/mockData';
import { getMonthKey, isDateInRange, normalizeDateValue } from '../../components/AdminDateFilter';
import { apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser } from '../../api/users';
import { apiGetVehicles, apiCreateVehicle } from '../../api/vehicles';
import type { User } from '../../data/mockData';

const ROLES: { value: 'agent' | 'delivery' | 'sklad'; labelKey: 'login.role.agent' | 'login.role.delivery' | 'login.role.sklad' }[] = [
  { value: 'agent', labelKey: 'login.role.agent' },
  { value: 'delivery', labelKey: 'login.role.delivery' },
  { value: 'sklad', labelKey: 'login.role.sklad' },
];

export const AdminAgents = () => {
  const { t, adminDateFrom, adminDateTo, orders } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: 'agent' as 'agent' | 'delivery' | 'sklad', vehicleName: '', vehicleOther: '', comment: '' });
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesList, setVehiclesList] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    apiGetVehicles()
      .then(data => { if (!cancelled) setVehiclesList((data || []).map(v => v.name)); })
      .catch(() => { if (!cancelled) setVehiclesList([]); });
    return () => { cancelled = true; };
  }, []);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [actionError, setActionError] = useState('');

  const hasFilter = Boolean(adminDateFrom || adminDateTo);
  const today = normalizeDateValue(new Date().toISOString());
  const referenceMonth = getMonthKey(adminDateTo || adminDateFrom || today, today);

  const loadStaff = async () => {
    try {
      const all = await apiGetUsers();
      setStaffList(all.filter(u => u.role === 'agent' || u.role === 'delivery' || u.role === 'sklad'));
    } catch {
      setStaffList(users.filter(u => u.role === 'agent' || u.role === 'delivery' || u.role === 'sklad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const openAdd = () => {
    setEditingUser(null);
    setForm({ name: '', phone: '', password: '', role: 'agent', vehicleName: '', vehicleOther: '', comment: '' });
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      phone: u.phone,
      password: '',
      role: u.role as 'agent' | 'delivery' | 'sklad',
      vehicleName: u.vehicleName && vehiclesList.includes(u.vehicleName) ? u.vehicleName : (u.vehicleName ? 'Boshqa' : ''),
      vehicleOther: u.vehicleName && !vehiclesList.includes(u.vehicleName) ? u.vehicleName : '',
      comment: u.comment || '',
    });
    setShowForm(true);
  };

  const handleAddVehicle = async () => {
    const name = newVehicleName.trim();
    if (!name || vehiclesList.includes(name)) return;
    try {
      await apiCreateVehicle(name);
      setVehiclesList(prev => [...prev, name]);
      setNewVehicleName('');
      setShowAddVehicleModal(false);
      if (showForm && form.role === 'delivery') setForm(p => ({ ...p, vehicleName: name }));
    } catch {
      // xato – qayta urinish
    }
  };

  const getStats = (userId: string, role: 'agent' | 'delivery') => {
    const userOrders = role === 'agent'
      ? orders.filter(o => o.agentId === userId)
      : orders.filter(o => o.deliveryId === userId && o.status === 'delivered');
    const primaryOrders = hasFilter
      ? userOrders.filter(o => isDateInRange(o.date, adminDateFrom, adminDateTo))
      : userOrders.filter(o => normalizeDateValue(o.date) === today);
    const monthlyOrders = userOrders.filter(o => getMonthKey(o.date, today) === referenceMonth);
    if (primaryOrders.length === 0 && monthlyOrders.length === 0) return null;
    const todaySales = primaryOrders.reduce((sum, o) => sum + o.total, 0);
    const itemsSold = primaryOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.total, 0);
    return { id: userId, todaySales, monthlySales, ordersCount: primaryOrders.length, itemsSold };
  };

  const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-green-500 to-green-600', 'from-orange-500 to-orange-600', 'from-teal-500 to-teal-600'];

  const resolveVehicle = () => (form.vehicleName === 'Boshqa' ? form.vehicleOther.trim() : form.vehicleName) || undefined;

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    const vehicleName = form.role === 'delivery' ? resolveVehicle() : undefined;
    if (editingUser) {
      try {
        const payload: Parameters<typeof apiUpdateUser>[1] = { name: form.name.trim(), phone: form.phone.trim(), role: form.role };
        if (form.password) payload.password = form.password;
        if (form.role === 'delivery') payload.vehicleName = vehicleName ?? '';
        if (form.role !== 'delivery') payload.vehicleName = '';
        payload.comment = form.comment.trim();
        await apiUpdateUser(editingUser.id, payload);
        await loadStaff();
        setShowForm(false);
      } catch {
        setStaffList(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: form.name, phone: form.phone, role: form.role, vehicleName, comment: form.comment.trim() || undefined } : u));
        setShowForm(false);
      }
    } else {
      if (!form.password.trim()) return;
      try {
        await apiCreateUser({ name: form.name.trim(), phone: form.phone.trim(), password: form.password, role: form.role, vehicleName, comment: form.comment.trim() || undefined });
        await loadStaff();
        setShowForm(false);
      } catch {
        setStaffList(prev => [...prev, { id: `u${Date.now()}`, name: form.name, phone: form.phone, role: form.role, vehicleName, comment: form.comment.trim() || undefined }]);
        setShowForm(false);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError('');
    try {
      await apiDeleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await loadStaff();
    } catch (e: any) {
      setActionError(e?.message || 'Xatolik');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.agentsPage')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{staffList.length} {t('common.pcs')}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {hasFilter && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <CalendarDays size={13} className="text-blue-500" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {adminDateFrom === adminDateTo ? adminDateFrom : `${adminDateFrom} → ${adminDateTo}`}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Truck size={15} />
              {t('admin.staff.addVehicle')}
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              <Plus size={15} />
              {t('admin.addAgent')}
            </button>
          </div>
        </div>

        {actionError && (
          <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 text-sm text-red-700 dark:text-red-300">
            {actionError}
          </div>
        )}

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{editingUser ? t('admin.staff.editTitle') : t('admin.addAgent')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">{t('admin.staff.form.fullName')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Sardor Toshmatov"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">{t('admin.staff.form.phone')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+998901234567"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  {t('admin.staff.form.password')} {editingUser && <span className="text-gray-400">{t('admin.staff.form.passwordHint')}</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="****"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">{t('admin.staff.form.role')}</label>
              <div className="flex gap-3">
                {ROLES.map(r => (
                  <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      checked={form.role === r.value}
                      onChange={() => setForm(p => ({ ...p, role: r.value }))}
                      className="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t(r.labelKey as any)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">{t('orders.comment')}</label>
              <textarea
                value={form.comment}
                onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                placeholder={t('returns.commentPlaceholder')}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB] resize-y"
              />
            </div>

            {form.role === 'delivery' && (
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1 flex items-center gap-1">
                  <Truck size={12} />
                  {t('admin.staff.form.vehicleLabel')}
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={form.vehicleName}
                    onChange={e => setForm(p => ({ ...p, vehicleName: e.target.value }))}
                    className="crm-select px-3 py-2.5 min-w-[180px]"
                  >
                    <option value="">{t('admin.staff.form.vehicleSelect')}</option>
                    {vehiclesList.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                    <option value="Boshqa">{t('admin.staff.form.vehicleOther')}</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicleModal(true)}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus size={14} />
                    {t('admin.staff.addVehicle')}
                  </button>
                  {form.vehicleName === 'Boshqa' && (
                    <input
                      type="text"
                      value={form.vehicleOther}
                      onChange={e => setForm(p => ({ ...p, vehicleOther: e.target.value }))}
                      placeholder="Mashina nomi"
                      className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB] min-w-[160px]"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700">
                {t('common.save')}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingUser(null); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}

        {showAddVehicleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60" onClick={() => setShowAddVehicleModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-5" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('admin.staff.addVehicle')}</h3>
              <input
                type="text"
                value={newVehicleName}
                onChange={e => setNewVehicleName(e.target.value)}
                placeholder="01 A 123 AB"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB] mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddVehicle}
                  disabled={!newVehicleName.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={() => { setShowAddVehicleModal(false); setNewVehicleName(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white">{t('admin.staff.deleteTitle')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{deleteTarget.name}</div>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-200">{t('admin.staff.deleteConfirm')}</p>
                <p className="text-xs text-amber-600 dark:text-amber-300">{t('admin.staff.deleteWarning')}</p>
              </div>
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffList.map((user, idx) => {
              const stats = getStats(user.id, user.role as 'agent' | 'delivery');
              return (
                <div key={user.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`bg-gradient-to-r ${colors[idx % colors.length]} p-5 text-white flex items-start justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-xl font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Phone size={12} className="text-white/70" />
                          <span className="text-white/80 text-xs">{user.phone}</span>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-white/20 text-xs">
                          {t(`login.role.${user.role}` as any)}
                        </span>
                        {user.vehicleName && (
                          <div className="flex items-center gap-1 mt-1 text-white/90 text-xs">
                            <Truck size={10} />
                            {user.vehicleName}
                          </div>
                        )}
                        {user.comment?.trim() && (
                          <div className="mt-2 max-w-[220px] rounded-lg bg-white/15 px-2.5 py-1.5 text-xs text-white/95">
                            <span className="font-semibold">{t('orders.comment')}:</span> {user.comment}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                        title={t('common.edit')}
                      >
                        <Edit2 size={16} className="text-white" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                  {stats ? (
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {user.role === 'delivery'
                              ? (hasFilter ? t('admin.staff.card.todaySales') : t('admin.staff.card.todaySales'))
                              : (hasFilter ? t('admin.agentStats.periodSalesByAgent') : t('admin.staff.card.todaySales'))}
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.todaySales.toLocaleString()} so'm</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {t('admin.staff.card.monthSales')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.monthlySales.toLocaleString()} so'm</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {user.role === 'delivery' ? t('admin.staff.card.ordersDelivery') : t('admin.staff.card.ordersAgent')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.ordersCount}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                            {user.role === 'delivery' ? t('admin.staff.card.itemsDelivery') : t('admin.staff.card.itemsAgent')}
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{stats.itemsSold} ta</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                        <>
                          <TrendingUp size={20} className="text-gray-300 dark:text-gray-500 mx-auto mb-1" />
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {user.role === 'delivery'
                              ? (hasFilter ? t('admin.agentStats.noDataForPeriod') : t('admin.agentStats.noData'))
                              : (hasFilter ? t('admin.agentStats.noDataForPeriod') : t('admin.agentStats.noData'))}
                          </p>
                        </>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
