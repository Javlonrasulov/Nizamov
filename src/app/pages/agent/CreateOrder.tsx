import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronRight, Plus, Minus, Package, User, CheckCircle, Search, ChevronDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { Client, Product, WeekDay } from '../../data/mockData';

type Step = 1 | 2 | 3;

// Bugungi kunni WeekDay ga aylantirish
const getTodayWeekDay = (): WeekDay | 'all' => {
  const dayIndex = new Date().getDay(); // 0=Yak, 1=Du, 2=Se, 3=Ch, 4=Pa, 5=Ju, 6=Sh
  const map: Record<number, WeekDay> = {
    1: 'du', 2: 'se', 3: 'ch', 4: 'pa', 5: 'ju', 6: 'sh',
  };
  return map[dayIndex] ?? 'all'; // Yakshanba = 'all'
};

interface SelectedItem {
  product: Product;
  quantity: number;
}

const WEEK_DAYS: Array<{ key: WeekDay | 'all'; label: string; short: string }> = [
  { key: 'all', label: 'Barcha kunlar', short: 'Bar' },
  { key: 'du', label: 'Dushanba', short: 'Du' },
  { key: 'se', label: 'Seshanba', short: 'Se' },
  { key: 'ch', label: 'Chorshanba', short: 'Ch' },
  { key: 'pa', label: 'Payshanba', short: 'Pa' },
  { key: 'ju', label: 'Juma', short: 'Ju' },
  { key: 'sh', label: 'Shanba', short: 'Sh' },
];

export const CreateOrder = () => {
  const { t, currentUser, clients, products, addOrder } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [selectedDay, setSelectedDay] = useState<WeekDay | 'all'>(getTodayWeekDay());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [success, setSuccess] = useState(false);
  const [dayDropdownOpen, setDayDropdownOpen] = useState(false);

  const myClients = clients.filter(c => c.agentId === currentUser?.id);
  const dayFilteredClients = selectedDay === 'all'
    ? myClients
    : myClients.filter(c => c.visitDays?.includes(selectedDay) ?? false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU') + " so'm";

  const setQty = (product: Product, delta: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.product.id !== product.id);
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { product, quantity: 1 }];
      return prev;
    });
  };

  const setQtyManual = (product: Product, val: string) => {
    const qty = parseInt(val);
    if (isNaN(qty) || qty < 0) return;
    setSelectedItems(prev => {
      if (qty === 0) return prev.filter(i => i.product.id !== product.id);
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: qty } : i);
      return [...prev, { product, quantity: qty }];
    });
  };

  const getQty = (productId: string) => selectedItems.find(i => i.product.id === productId)?.quantity || 0;

  const handleConfirm = () => {
    if (!selectedClient || selectedItems.length === 0) return;
    addOrder({
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientPhone: selectedClient.phone,
      clientAddress: selectedClient.address,
      agentId: currentUser?.id || '',
      agentName: currentUser?.name || '',
      items: selectedItems.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total: totalAmount,
      status: 'new',
      date: new Date().toISOString().split('T')[0],
    });
    setSuccess(true);
    setTimeout(() => navigate('/agent/orders'), 1800);
  };

  const steps = [
    { num: 1, label: t('orders.step1') },
    { num: 2, label: t('orders.step2') },
    { num: 3, label: t('orders.step3') },
  ];

  if (success) {
    return (
      <MobileShell>
        <MobileContent className="flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{t('orders.success')}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Zakazlar ro'yxatiga qaytmoqda...</p>
          </div>
        </MobileContent>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <MobileHeader title={t('orders.create')} showBack showLang />
      <MobileContent className="pb-24">
        <div className="p-4">
          {/* Step indicator */}
          <div className="flex items-center mb-6">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step > s.num ? 'bg-green-500 text-white' :
                    step === s.num ? 'bg-[#2563EB] text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {step > s.num ? <Check size={14} /> : s.num}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${step === s.num ? 'text-[#2563EB]' : 'text-gray-400 dark:text-gray-500'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.num ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Day + Client selection */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Day selector */}
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm">{t('orders.selectDay')}</h3>
                <div className="relative">
                  <button
                    onClick={() => setDayDropdownOpen(!dayDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-[#2563EB] text-white shadow-md shadow-blue-200"
                  >
                    <span>{WEEK_DAYS.find(day => day.key === selectedDay)?.label || 'Barcha kunlar'}</span>
                    <ChevronDown size={16} className={`transition-transform ${dayDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dayDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 overflow-hidden">
                      {WEEK_DAYS.map(day => (
                        <button
                          key={day.key}
                          onClick={() => { setSelectedDay(day.key); setSelectedClient(null); setDayDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all ${
                            selectedDay === day.key
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clients for selected day */}
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm">
                  {t('orders.selectClient')}
                  <span className="ml-2 text-xs text-gray-400 font-normal">({dayFilteredClients.length} ta klient)</span>
                </h3>
                <div className="space-y-2">
                  {dayFilteredClients.length > 0 ? (
                    dayFilteredClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                          selectedClient?.id === client.id
                            ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{client.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{client.phone}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{client.address}</p>
                        </div>
                        {selectedClient?.id === client.id && (
                          <Check size={16} className="text-[#2563EB] flex-shrink-0" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Bu kun uchun klientlar yo'q</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Boshqa kun tanlang</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => selectedClient && setStep(2)}
                disabled={!selectedClient}
                className="w-full py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Davom etish <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Products */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{t('orders.selectProducts')}</h3>
                {selectedItems.length > 0 && (
                  <span className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    {selectedItems.length} ta tanlandi
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder={t('orders.searchProduct')}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 dark:placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                {filteredProducts.map(product => {
                  const qty = getQty(product.id);
                  return (
                    <div key={product.id} className={`bg-white dark:bg-gray-800 rounded-xl p-3 border-2 transition-all ${qty > 0 ? 'border-[#2563EB]' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Package size={15} className="text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white leading-tight">{product.name}</p>
                          <p className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold mt-0.5">{formatCurrency(product.price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setQty(product, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 dark:text-gray-300 flex items-center justify-center disabled:opacity-30 active:bg-gray-100 dark:active:bg-gray-700"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty || ''}
                            onChange={e => setQtyManual(product, e.target.value)}
                            placeholder="0"
                            className="w-10 h-7 text-center text-sm font-bold border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:border-[#2563EB] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => setQty(product, 1)}
                            className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center active:bg-blue-700"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedItems.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sticky bottom-0">
                  <p className="text-sm font-semibold text-[#2563EB] dark:text-blue-400">
                    Jami: {formatCurrency(totalAmount)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  {t('common.back')}
                </button>
                <button
                  onClick={() => selectedItems.length > 0 && setStep(3)}
                  disabled={selectedItems.length === 0}
                  className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-700 flex items-center justify-center gap-1"
                >
                  Davom <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('orders.summary')}</h3>

              {/* Client */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t('orders.client')}</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedClient?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedClient?.phone}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedClient?.address}</p>
              </div>

              {/* Items */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('orders.items')}</p>
                </div>
                {selectedItems.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} ta × {formatCurrency(item.product.price)}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.quantity * item.product.price)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('orders.totalAmount')}</p>
                  <p className="text-base font-bold text-[#2563EB] dark:text-blue-400">{formatCurrency(totalAmount)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  {t('common.back')}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-lg shadow-green-200"
                >
                  <Check size={15} /> {t('orders.tayyor')}
                </button>
              </div>
            </div>
          )}
        </div>
      </MobileContent>
      <MobileNav role="agent" />
    </MobileShell>
  );
};