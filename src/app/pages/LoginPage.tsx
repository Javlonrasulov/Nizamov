import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Phone, Lock, ChevronDown, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Language, languageLabels } from '../i18n/translations';

export const LoginPage = () => {
  const { t, lang, setLang, login } = useApp();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const langs: Language[] = ['uz_lat', 'uz_kir', 'ru'];

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await login(phone, password);
      if (user) {
        if (user.role === 'agent') navigate('/agent');
        else if (user.role === 'delivery') navigate('/delivery');
        else navigate('/admin');
      } else {
        setError('Telefon raqam yoki parol noto\'g\'ri');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Language switcher */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
          >
            <Globe size={14} />
            {languageLabels[lang]}
            <ChevronDown size={12} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl z-50 overflow-hidden min-w-[180px] border border-gray-100">
              {langs.map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${lang === l ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {languageLabels[l]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{t('login.title')}</h1>
          <p className="text-blue-300/80 text-sm mt-1">{t('login.subtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
          {/* Phone */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-1.5">{t('login.phone')}</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('login.phone.placeholder')}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 block mb-1.5">{t('login.password')}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('login.password.placeholder')}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-blue-50 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#2563EB] text-white font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 disabled:opacity-70"
          >
            {loading ? '...' : t('login.button')}
          </button>
        </div>
      </div>
    </div>
  );
};