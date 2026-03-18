import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, CheckCircle, User, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileShell, MobileHeader, MobileContent } from '../../components/MobileShell';
import { MobileNav } from '../../components/MobileNav';
import { MapPicker } from '../../components/MapPicker';
import { WeekDay } from '../../data/mockData';

const DAYS: Array<{ key: WeekDay; labelKey: any }> = [
  { key: 'du', labelKey: 'days.monday' },
  { key: 'se', labelKey: 'days.tuesday' },
  { key: 'ch', labelKey: 'days.wednesday' },
  { key: 'pa', labelKey: 'days.thursday' },
  { key: 'ju', labelKey: 'days.friday' },
  { key: 'sh', labelKey: 'days.saturday' },
];

export const AddClient = () => {
  const { t, currentUser, addClient } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });
  const [visitDays, setVisitDays] = useState<WeekDay[]>([]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: WeekDay) => {
    setVisitDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleMapConfirm = (lat: number, lng: number) => {
    setForm(prev => ({ ...prev, lat, lng }));
    setShowMapPicker(false);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t('clients.validation.nameRequired');
    if (!form.phone.trim()) errs.phone = t('clients.validation.phoneRequired');
    if (!form.address.trim()) errs.address = t('clients.validation.addressRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    addClient({ ...form, visitDays, agentId: currentUser?.id || '' });
    setSaved(true);
    setTimeout(() => navigate('/agent/clients'), 1500);
  };

  if (saved) {
    return (
      <MobileShell>
        <MobileContent className="flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">{t('clients.add.savedTitle')}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('clients.add.savedSubtitle')}</p>
          </div>
        </MobileContent>
      </MobileShell>
    );
  }

  const inputBase = 'w-full py-3 rounded-xl border text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 dark:text-white';

  return (
    <MobileShell>
      <MobileHeader title={t('clients.form.title')} showBack showLang />
      <MobileContent className="pb-24">
        <div className="p-4 space-y-4">

          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-1.5">
              {t('clients.add.shopNameLabel')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('clients.add.shopNamePlaceholder')}
                className={`${inputBase} pl-9 pr-4 ${errors.name ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-1.5">
              {t('clients.form.phone')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder={t('login.phone.placeholder')}
                className={`${inputBase} pl-9 pr-4 ${errors.phone ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}`}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-1.5">
              {t('clients.form.address')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder={t('clients.add.addressPlaceholder')}
                rows={2}
                className={`${inputBase} pl-9 pr-4 resize-none ${errors.address ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'}`}
              />
            </div>
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          {/* Visit Days */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-2">
              {t('clients.add.visitDaysLabel')}
              <span className="ml-1.5 text-xs text-gray-400 font-normal">{t('clients.add.visitDaysHint')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DAYS.map(day => (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    visitDays.includes(day.key)
                      ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {t(day.labelKey)}
                </button>
              ))}
            </div>
            {visitDays.length > 0 && (
              <p className="text-xs text-[#2563EB] dark:text-blue-400 mt-1.5 font-medium">
                {t('clients.add.selectedDays')}: {visitDays.map(d => t(DAYS.find(dd => dd.key === d)?.labelKey || d)).join(', ')}
              </p>
            )}
          </div>

          {/* GPS Location */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-1.5">
              {t('clients.form.location')}
            </label>
            <button
              onClick={() => setShowMapPicker(true)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed transition-all text-sm font-medium ${
                form.lat
                  ? 'border-green-300 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:border-blue-500'
              }`}
            >
              {form.lat ? (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  {t('clients.add.locationSelectedEdit')}
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  {t('clients.add.locationSelect')}
                </>
              )}
            </button>

            {form.lat && form.lng && (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-2 px-3 py-2">
                  <MapPin size={13} className="text-green-600 shrink-0" />
                  <span className="text-xs font-mono text-gray-700 dark:text-gray-200">
                    {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                  </span>
                  <button
                    onClick={() => setShowMapPicker(true)}
                    className="ml-auto text-xs text-[#2563EB] dark:text-blue-400 font-medium hover:underline"
                  >
                    {t('clients.add.locationView')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200 mt-2"
          >
            {t('common.save')}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </MobileContent>

      <MobileNav role="agent" />

      {showMapPicker && (
        <MapPicker
          initialLat={form.lat}
          initialLng={form.lng}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </MobileShell>
  );
};
