import { ReactNode, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Language, languageLabels } from '../i18n/translations';
import { Globe, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

interface MobileShellProps {
  children: ReactNode;
}

export const MobileShell = ({ children }: MobileShellProps) => {
  return (
    <div className="min-h-screen bg-gray-200 dark:bg-gray-950 flex items-start justify-center py-0 md:py-8 transition-colors duration-300">
      <div className="w-full max-w-[390px] min-h-screen md:min-h-0 md:h-[844px] bg-[#F8FAFC] dark:bg-gray-900 md:rounded-[40px] md:shadow-2xl overflow-hidden flex flex-col relative md:border-4 md:border-gray-800 dark:md:border-gray-700 transition-colors duration-300">
        {children}
      </div>
    </div>
  );
};

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showLang?: boolean;
  showLogout?: boolean;
  rightElement?: ReactNode;
}

export const MobileHeader = ({ title, showBack = false, showLang = true, showLogout = false, rightElement }: MobileHeaderProps) => {
  const { lang, setLang, logout, theme, toggleTheme } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const langs: Language[] = ['uz_lat', 'uz_kir', 'ru'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  const handleSelectLang = (l: Language) => {
    setLang(l);
    setLangOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-700 dark:text-gray-200">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {rightElement}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-gray-500" />}
        </button>
        {showLang && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Globe size={13} />
              {lang === 'uz_lat' ? "O'z" : lang === 'uz_kir' ? 'Ўз' : 'Ru'}
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[9999] overflow-hidden min-w-[160px]">
                {langs.map(l => (
                  <button
                    key={l}
                    onMouseDown={e => { e.preventDefault(); handleSelectLang(l); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${lang === l ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {languageLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {showLogout && (
          <button onClick={handleLogout} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

interface MobileContentProps {
  children: ReactNode;
  className?: string;
}

export const MobileContent = ({ children, className = '' }: MobileContentProps) => {
  return (
    <div className={`flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`}>
      {children}
    </div>
  );
};
