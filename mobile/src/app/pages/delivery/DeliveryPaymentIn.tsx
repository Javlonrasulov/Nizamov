import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Check, ChevronDown, CreditCard, Search, X, MapPin, Edit2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { apiCreatePayment, apiGetClientBalance, ClientBalance, PaymentMethod } from '../../api/payments';
import { MapPicker } from '../../components/MapPicker';

const INITIAL_VISIBLE = 5;

export const DeliveryPaymentIn = () => {
  const { t, lang, currentUser, clients, orders, refetchData, updateClient } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [debtorsOnly, setDebtorsOnly] = useState(false);
  const [expandClients, setExpandClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amount, setAmount] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, ClientBalance>>({});
  const [balancesLoading, setBalancesLoading] = useState<Record<string, boolean>>({});

  useEffect(() => { refetchData?.(); }, [refetchData]);

  const deliveryClientIds = useMemo(() => {
    const ids = new Set<string>();
    orders
      .filter(o => o.deliveryId === currentUser?.id)
      .forEach(o => ids.add(o.clientId));
    return ids;
  }, [orders, currentUser?.id]);

  const myClients = useMemo(
    () => clients.filter(c => deliveryClientIds.has(c.id)),
    [clients, deliveryClientIds]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let base = myClients;
    if (q) {
      base = myClients.filter(c =>
        c.name.toLowerCase().includes(q)
        || c.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
        || c.address.toLowerCase().includes(q),
      );
    }

    if (!debtorsOnly) return base;

    return base.filter(c => {
      // Balans hali yuklanmagan bo'lsa — filtrda yo'qolib qolmasligi uchun ko'rsatamiz
      if (balancesLoading[c.id]) return true;
      if (balances[c.id] == null) return true;
      return (balances[c.id]?.debt ?? 0) > 0;
    });
  }, [myClients, search, debtorsOnly, balances, balancesLoading]);

  const visible = expandClients ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hasMore = filtered.length > INITIAL_VISIBLE;
  const selectedClient = selectedClientId ? myClients.find(c => c.id === selectedClientId) : null;
  const selectedDebt = selectedClient ? (balances[selectedClient.id]?.debt ?? 0) : 0;
  const selectedBalanceLoaded = selectedClient ? balances[selectedClient.id] != null : false;

  // balances ni dependency qilmaslik — har yuklashda effekt bekor bo‘lib qarzlar yuklanmasligi mumkin.
  useEffect(() => {
    const ids = new Set<string>();
    const vis = expandClients ? filtered : filtered.slice(0, INITIAL_VISIBLE);
    vis.forEach(c => ids.add(c.id));
    if (selectedClientId) ids.add(selectedClientId);
    const toLoad = Array.from(ids).filter(id => !balances[id] && !balancesLoading[id]);
    if (toLoad.length === 0) return;

    let cancelled = false;
    (async () => {
      for (const id of toLoad) {
        if (cancelled) return;
        setBalancesLoading(prev => ({ ...prev, [id]: true }));
        try {
          const bal = await apiGetClientBalance(id);
          if (!cancelled) setBalances(prev => ({ ...prev, [id]: bal }));
        } catch {
          // ignore
        } finally {
          setBalancesLoading(prev => ({ ...prev, [id]: false }));
        }
      }
    })();
    return () => { cancelled = true; };
  }, [filtered, expandClients, selectedClientId]);

  const reset = () => {
    setStep(1);
    setSearch('');
    setExpandClients(false);
    setSelectedClientId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setMethod('cash');
    setAmount('');
    setSaving(false);
    setSavedOk(false);
  };

  const canSubmit = !!selectedClient && !!date && parseInt(amount || '0', 10) > 0 && !!currentUser?.id;
  const formattedAmount = amount ? parseInt(amount, 10).toLocaleString('ru-RU') : '';

  const handleSubmit = async () => {
    if (!canSubmit || !selectedClient || !currentUser) return;
    setSaving(true);
    try {
      await apiCreatePayment({
        clientId: selectedClient.id,
        amount: parseInt(amount, 10),
        method,
        date,
        collectedByUserId: currentUser.id,
      });
      setSavedOk(true);
      setTimeout(() => {
        reset();
        navigate('/delivery');
      }, 800);
    } finally {
      setSaving(false);
    }
  };

  const handleLocationConfirm = async (lat: number, lng: number) => {
    if (!selectedClient) return;
    setSavingLocation(true);
    try {
      await updateClient(selectedClient.id, { lat, lng });
    } finally {
      setSavingLocation(false);
      setShowMapPicker(false);
    }
  };

  return (
    <MobileShell>
      <MobileHeader title={t('payments.in.title')} showBack showLang showLogout />
      <MobileContent className="pb-20">
        <div className="p-4 space-y-4">
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{t('payments.in.selectClient')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} {t('clients.countSuffix')}</p>
                </div>
                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                    title={t('common.clear')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">
                <input
                  type="checkbox"
                  checked={debtorsOnly}
                  onChange={e => setDebtorsOnly(e.target.checked)}
                  className="accent-[#2563EB]"
                />
                {t('delivery.debtorsOnlyFilter')}
              </label>

              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t('clients.search')}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                {visible.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedClientId(c.id); setStep(2); }}
                    className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 hover:border-[#2563EB]/50 dark:hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        balancesLoading[c.id] || balances[c.id] == null
                          ? 'bg-gray-100 text-gray-500'
                          : (balances[c.id]?.debt ?? 0) > 0
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {balancesLoading[c.id] || balances[c.id] == null
                          ? '...'
                          : (balances[c.id]?.debt ?? 0) > 0
                          ? `${t('payments.badge.debt')}: ${(balances[c.id]?.debt ?? 0).toLocaleString('ru-RU')} ${t('common.sum')}`
                          : t('payments.badge.paid')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.phone}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{c.address}</p>
                  </button>
                ))}

                {hasMore && !expandClients && (
                  <button
                    type="button"
                    onClick={() => setExpandClients(true)}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-[#2563EB]/40 text-[#2563EB] dark:text-blue-400 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <ChevronDown size={16} />
                    {t('common.showAllWithCount').replace('N', String(filtered.length))}
                  </button>
                )}

                {filtered.length === 0 && (
                  <div className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">
                    {t('clients.empty')}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && selectedClient && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t('payments.in.client')}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{selectedClient.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{selectedClient.phone}</p>
                    <p className={`text-xs mt-1 ${
                      balancesLoading[selectedClient.id] || !selectedBalanceLoaded
                        ? 'text-gray-400 dark:text-gray-500'
                        : selectedDebt > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {balancesLoading[selectedClient.id] || !selectedBalanceLoaded
                        ? '...'
                        : `${t('payments.clientDebt')}: ${selectedDebt.toLocaleString('ru-RU')} ${t('common.sum')}`}
                    </p>

                    <div className="mt-3 flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="flex-1 text-xs text-gray-600 dark:text-gray-300 px-3 py-2">
                        {selectedClient.lat != null && selectedClient.lng != null
                          ? `📍 ${selectedClient.lat.toFixed(5)}, ${selectedClient.lng.toFixed(5)}`
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep(1); }}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('common.change')}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">{t('common.date')}</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">{t('payments.method')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['cash', 'terminal', 'transfer'] as PaymentMethod[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
                          method === m
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {t(`payments.method.${m}` as any)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">{t('payments.amount')}</label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      inputMode="numeric"
                      value={formattedAmount}
                      onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                      placeholder={t('payments.amount.placeholder')}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 dark:placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit || saving}
                  className="w-full py-3.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {savedOk ? <Check size={16} /> : null}
                  {savedOk ? t('payments.saved') : (saving ? '...' : t('common.save'))}
                </button>
              </div>
            </>
          )}
        </div>
      </MobileContent>
      <MobileNav role="delivery" />

      {showMapPicker && selectedClient && (
        <MapPicker
          initialLat={selectedClient.lat}
          initialLng={selectedClient.lng}
          onConfirm={handleLocationConfirm}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      {editingClientId && (
        <DeliveryClientEditModal
          clientId={editingClientId}
          onClose={() => setEditingClientId(null)}
        />
      )}
    </MobileShell>
  );
};

// ── Delivery Client Edit Modal ─────────────────────────────────────────
function DeliveryClientEditModal({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const { clients, updateClient, t } = useApp();
  const client = clients.find(c => c.id === clientId);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    setForm({
      name: client.name ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
      lat: client.lat,
      lng: client.lng,
    });
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (!client) return null;

  const normalizePhone = (s: string) => (s || '').replace(/\D/g, '');
  const phoneNorm = normalizePhone(form.phone);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t('clients.validation.nameRequired');
    if (!form.phone.trim()) errs.phone = t('clients.validation.phoneRequired');
    if (!form.address.trim()) errs.address = t('clients.validation.addressRequired');
    if (form.lat == null || form.lng == null) errs.location = t('clients.validation.locationRequired');

    if (!errs.phone) {
      const dup = clients.some(c =>
        c.id !== client.id && normalizePhone(c.phone) === phoneNorm
      );
      if (dup) errs.phone = t('clients.validation.phoneDuplicate');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (saving) return;
    if (!validate()) return;
    setSaving(true);
    updateClient(client.id, {
      name: form.name,
      phone: form.phone,
      address: form.address,
      lat: form.lat,
      lng: form.lng,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9000] bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl overflow-hidden border-t border-gray-100 flex flex-col"
        style={{ height: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Edit2 size={18} className="text-[#2563EB]" />
            <p className="text-sm font-bold text-gray-900">{t('clients.edit.title')}</p>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            onClick={onClose}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('clients.form.name')}</label>
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('clients.form.phone')}</label>
            <input
              value={form.phone}
              onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('clients.form.address')}</label>
            <textarea
              value={form.address}
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
              className="w-full py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 resize-none focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t('clients.form.location')}</label>
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed transition-all text-sm font-medium ${
                form.lat != null && form.lng != null
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}
            >
              <MapPin size={16} />
              {form.lat != null && form.lng != null
                ? t('clients.add.locationSelectedEdit')
                : t('clients.add.locationSelect')}
            </button>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-500">
              {form.lat != null && form.lng != null
                ? `📍 ${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}`
                : '—'}
            </p>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-semibold disabled:opacity-60"
            >
              {saving ? '...' : t('common.save')}
            </button>
          </div>
        </div>

        {showMapPicker && (
          <MapPicker
            initialLat={form.lat}
            initialLng={form.lng}
            onConfirm={(lat, lng) => {
              setForm(prev => ({ ...prev, lat, lng }));
              setShowMapPicker(false);
            }}
            onClose={() => setShowMapPicker(false)}
          />
        )}
      </div>
    </div>
  );
}

