import React, { useState } from 'react';
import {
  MapPin,
  Moon,
  Sun,
  Volume2,
  Bell,
  Download,
  Trash2,
  Info,
  ShieldCheck,
  Compass,
  Check
} from 'lucide-react';
import { UserSettings } from '../types';
import { EGYPTIAN_CITIES } from '../core/prayer/EgyptPrayerTimesEngine';
import { db } from '../data/db';

interface SettingsScreenProps {
  settings: UserSettings;
  onUpdateCity: (cityName: string) => void;
  onToggleDarkMode: (isDark: boolean | null) => void;
  onToggleSound: (enabled: boolean) => void;
  onToggleNotifications: (enabled: boolean) => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateCity,
  onToggleDarkMode,
  onToggleSound,
  onToggleNotifications,
  onResetData
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleExport = () => {
    const jsonStr = db.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ahl_al_quran_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('تم تصدير البيانات بنجاح في ملف JSON');
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        onToggleNotifications(true);
      } else {
        onToggleNotifications(false);
      }
    } else {
      onToggleNotifications(!settings.notificationsEnabled);
    }
  };

  return (
    <div id="settings_screen" className="max-w-xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Location & Prayer Calculation */}
      <div className="bg-white dark:bg-[#111E1A] rounded-3xl p-6 shadow-xs border border-gray-100 dark:border-[#223A33]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#E6F6EE] dark:bg-[#164E3D]/40 text-[#1E8258] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              المحافظة ومواقيت الصلاة
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              وفق معايير الهيئة المصرية العامة للمساحة
            </p>
          </div>
        </div>

        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          المحافظة المختارة:
        </label>
        <select
          id="settings_city_select"
          value={settings.selectedCity}
          onChange={(e) => onUpdateCity(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-[#223A33] bg-gray-50 dark:bg-[#182B25] text-gray-900 dark:text-white text-sm font-bold focus:outline-none focus:border-[#28876B] cursor-pointer"
        >
          {EGYPTIAN_CITIES.map((city) => (
            <option key={city.id} value={city.nameArabic}>
              {city.nameArabic}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-gray-400 mt-2">
          زاوية الفجر: 19.5° • زاوية العشاء: 17.5° • العصر: مذهب الشافعي والجمهور
        </p>
      </div>

      {/* 2. Preferences (Theme, Sound, Notifications) */}
      <div className="bg-white dark:bg-[#111E1A] rounded-3xl p-6 shadow-xs border border-gray-100 dark:border-[#223A33] space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          التفضيلات والتخصيص
        </h3>

        {/* Theme */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#223A33]">
          <div className="flex items-center gap-3">
            {settings.isDarkMode ? (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white block">
                المظهر الداكن (الوضع الليلي)
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ألوان هادئة ومريحة للعينين في الليل
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleDarkMode(!settings.isDarkMode)}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
              settings.isDarkMode ? 'bg-[#28876B]' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                settings.isDarkMode ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>

        {/* Sound Feedback */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#223A33]">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white block">
                الصوت والاهتزاز عند التسبيح
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                نقرة خشبية هادئة واحتفال لطيف عند إكمال الأهداف
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleSound(!settings.soundEnabled)}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
              settings.soundEnabled ? 'bg-[#28876B]' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                settings.soundEnabled ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <div>
              <span className="text-sm font-bold text-gray-900 dark:text-white block">
                تنبيهات الصلاة ومحاسبة اليوم
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                تذكيرات خفيفة لمواعيد الصلوات ووردك
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRequestNotification}
            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
              settings.notificationsEnabled ? 'bg-[#28876B]' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                settings.notificationsEnabled ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Data Storage & Backup */}
      <div className="bg-white dark:bg-[#111E1A] rounded-3xl p-6 shadow-xs border border-gray-100 dark:border-[#223A33] space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          إدارة البيانات والنسخ الاحتياطي
        </h3>

        {exportNotice && (
          <div className="p-3 rounded-xl bg-[#E6F6EE] text-[#1E8258] text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {exportNotice}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            id="export_data_btn"
            type="button"
            onClick={handleExport}
            className="flex-1 py-3 px-4 rounded-2xl border border-gray-200 dark:border-[#223A33] hover:bg-gray-50 dark:hover:bg-[#182B25] text-gray-800 dark:text-gray-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#28876B]" />
            تصدير نسخة احتياطية (JSON)
          </button>

          <button
            id="reset_data_btn"
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="py-3 px-4 rounded-2xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            إعادة ضبط البيانات
          </button>
        </div>

        {showResetConfirm && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-right space-y-3 animate-in fade-in duration-150">
            <p className="text-xs text-red-800 dark:text-red-300 font-medium leading-relaxed">
              هل أنت متأكد من رغبتك في حذف جميع السجلات والصلوات والتسبيحات؟ لن تتمكن من استرجاعها إلا في حال قمت بتصدير نسخة احتياطية.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#111E1A] border border-gray-300 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white shadow-xs hover:bg-red-700 cursor-pointer"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. About the App */}
      <div className="bg-[#EFF4F2] dark:bg-[#182B25] rounded-3xl p-6 border border-gray-200/60 dark:border-[#223A33] text-right space-y-3">
        <div className="flex items-center gap-2 text-[#164E3D] dark:text-[#A5DCCB]">
          <ShieldCheck className="w-5 h-5" />
          <h4 className="font-bold text-sm">عن تطبيق «أهل القرآن» 🤍</h4>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          تطبيق إسلامي مصمم ليكون خاليًا من المشتتات والإعلانات. يعمل محليًا بالكامل على جهازك (Offline-First) ويحفظ جميع بياناتك بأمان تام دون أي تتبع أو نقل بيانات إلى خوادم خارجية.
        </p>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-200/60 dark:border-[#223A33] pt-3 flex items-center justify-between">
          <span>الإصدار 1.0.0 (نسخة الويب)</span>
          <span>تقبل الله منا ومنكم صالح الأعمال 🤲</span>
        </div>
      </div>
    </div>
  );
};
