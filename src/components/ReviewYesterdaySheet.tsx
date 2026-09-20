import React, { useState } from 'react';
import { Moon, CheckCircle2, X, Clock, Check, AlertCircle } from 'lucide-react';
import { CounterRecord, HabitRecord, PrayerRecord, PrayerStatus } from '../types';
import {
  getPrayerDisplayName,
  getPrayerStatusDisplayName,
  getHabitDisplayName,
  getCounterDisplayName
} from '../utils/displayNames';

interface ReviewYesterdaySheetProps {
  isOpen: boolean;
  dayKey?: string;
  title?: string;
  dateFormattedArabic: string;
  allPrayers?: PrayerRecord[];
  allHabits?: HabitRecord[];
  allCounters?: CounterRecord[];
  unrecordedPrayers?: PrayerRecord[];
  incompleteHabits?: HabitRecord[];
  onClose: () => void;
  onConfirm: (
    prayerUpdates: Record<string, PrayerStatus>,
    habitUpdates: Record<string, boolean>,
    counterUpdates?: Record<string, boolean>
  ) => void;
}

export const ReviewYesterdaySheet: React.FC<ReviewYesterdaySheetProps> = ({
  isOpen,
  dayKey,
  title,
  dateFormattedArabic,
  allPrayers = [],
  allHabits = [],
  allCounters = [],
  unrecordedPrayers = [],
  incompleteHabits = [],
  onClose,
  onConfirm
}) => {
  // Ensure prayers are in canonical order: Fajr, Dhuhr, Asr, Maghrib, Isha
  const PRAYER_ORDER: Record<string, number> = { FAJR: 1, DHUHR: 2, ASR: 3, MAGHRIB: 4, ISHA: 5 };
  const rawPrayers = allPrayers.length > 0 ? allPrayers : unrecordedPrayers;
  const prayersToReview = [...rawPrayers].sort(
    (a, b) => (PRAYER_ORDER[a.prayer] || 99) - (PRAYER_ORDER[b.prayer] || 99)
  );
  const habitsToReview = allHabits.length > 0 ? allHabits : incompleteHabits;

  // Status maps
  const [prayerStatusMap, setPrayerStatusMap] = useState<Record<string, PrayerStatus>>({});
  const [habitCompletedMap, setHabitCompletedMap] = useState<Record<string, boolean>>({});
  const [counterCompletedMap, setCounterCompletedMap] = useState<Record<string, boolean>>({});

  // Sync state when sheet opens or day changes
  React.useEffect(() => {
    if (!isOpen) return;

    const pInit: Record<string, PrayerStatus> = {};
    prayersToReview.forEach((p) => {
      pInit[p.prayer] = p.status;
    });
    setPrayerStatusMap(pInit);

    const hInit: Record<string, boolean> = {};
    habitsToReview.forEach((h) => {
      hInit[h.habitKey] = h.isCompleted;
    });
    setHabitCompletedMap(hInit);

    const cInit: Record<string, boolean> = {};
    allCounters.forEach((c) => {
      cInit[c.counterKey] = c.isCompleted || c.count >= c.target;
    });
    setCounterCompletedMap(cInit);
  }, [isOpen, dateFormattedArabic, allPrayers, allHabits, allCounters]);

  // Track if user is editing a specific prayer
  const [editingPrayerKey, setEditingPrayerKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrayerChange = (prayer: string, status: PrayerStatus) => {
    setPrayerStatusMap((prev) => ({ ...prev, [prayer]: status }));
    setEditingPrayerKey(null);
  };

  const handleHabitChange = (habitKey: string, done: boolean) => {
    setHabitCompletedMap((prev) => ({ ...prev, [habitKey]: done }));
  };

  const handleCounterToggle = (counterKey: string) => {
    setCounterCompletedMap((prev) => ({ ...prev, [counterKey]: !prev[counterKey] }));
  };

  const handleSubmit = () => {
    onConfirm(prayerStatusMap, habitCompletedMap, counterCompletedMap);
    onClose();
  };

  // Count unrecorded prayers
  const unrecordedCount = prayersToReview.filter(
    (p) => (prayerStatusMap[p.prayer] || p.status) === 'UNRECORDED'
  ).length;

  const headerTitle = title || (dateFormattedArabic.includes('أمس') ? 'مراجعة مهام أمس 🌙' : 'مراجعة مهام اليوم 🌙');

  return (
    <div
      id="review_yesterday_sheet_overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="review_yesterday_sheet_content"
        className="w-full max-w-xl bg-white dark:bg-[#111E1A] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-[#223A33] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#223A33] pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4EFE6] dark:bg-[#164E3D]/40 text-[#164E3D] dark:text-[#A5DCCB] flex items-center justify-center">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {headerTitle}
              </h3>
              <p className="text-xs text-[#28876B] dark:text-[#3DA384] font-semibold">
                {dateFormattedArabic}
              </p>
            </div>
          </div>
          <button
            id="close_review_yesterday_btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#182B25] text-gray-500 cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 mb-5 rounded-2xl bg-[#F0FDF4] dark:bg-[#132B22] border border-[#DCFCE7] dark:border-[#1E3A2F] text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          سجّل ما أديته بهدوء وطمأنينة دون ضغط. ما كان مسجلاً يظهر كما هو، ويمكنك إثبات ما لم يُسجل بعد. عدم التسجيل لا يعني عدم أداء العبادة 🤍
        </div>

        {/* 1. الصلوات الخمس */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>الصلوات الخمس</span>
              {unrecordedCount > 0 && (
                <span className="text-[11px] font-normal text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  {unrecordedCount} صلوات بانتظار التحديد
                </span>
              )}
            </h4>
          </div>

          <div className="space-y-2.5">
            {prayersToReview.map((p) => {
              const currentStatus = prayerStatusMap[p.prayer] || p.status;
              const isRecorded = currentStatus !== 'UNRECORDED';
              const isEditing = editingPrayerKey === p.prayer || !isRecorded;
              const prayerArabic = getPrayerDisplayName(p.prayer);

              return (
                <div
                  key={p.prayer}
                  id={`review_prayer_${p.prayer.toLowerCase()}`}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    !isRecorded
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                      : 'bg-gray-50 dark:bg-[#182B25] border-gray-200/80 dark:border-[#223A33]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        صلاة {prayerArabic}
                      </span>
                      {isRecorded && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#E6F6EE] dark:bg-[#164E3D]/50 text-[#1E8258] dark:text-[#A5DCCB]">
                          ✓ {getPrayerStatusDisplayName(currentStatus)}
                        </span>
                      )}
                      {!isRecorded && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          لم تُسجل بعد ○
                        </span>
                      )}
                    </div>

                    {isRecorded && !isEditing && (
                      <button
                        type="button"
                        onClick={() => setEditingPrayerKey(p.prayer)}
                        className="text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline cursor-pointer"
                      >
                        تعديل
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                      <button
                        type="button"
                        onClick={() => handlePrayerChange(p.prayer, 'CONGREGATION')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          currentStatus === 'CONGREGATION'
                            ? 'bg-[#E6F6EE] border-[#1E8258] text-[#1E8258] dark:bg-[#164E3D]/60 dark:border-[#3DA384] shadow-xs'
                            : 'bg-white dark:bg-[#111E1A] border-gray-200 dark:border-[#223A33] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span>جماعة 🕌</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrayerChange(p.prayer, 'INDIVIDUAL')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          currentStatus === 'INDIVIDUAL'
                            ? 'bg-[#E6F3F6] border-[#327A8A] text-[#327A8A] dark:bg-[#1b3d45]/60 dark:border-[#4fa7b8] shadow-xs'
                            : 'bg-white dark:bg-[#111E1A] border-gray-200 dark:border-[#223A33] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span>منفرد ✓</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrayerChange(p.prayer, 'MISSED')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          currentStatus === 'MISSED'
                            ? 'bg-[#FDECEB] border-[#B3534B] text-[#B3534B] dark:bg-[#48201d]/60 dark:border-[#db776f] shadow-xs'
                            : 'bg-white dark:bg-[#111E1A] border-gray-200 dark:border-[#223A33] text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span>لم أصلِّ ✕</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrayerChange(p.prayer, 'UNRECORDED')}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          currentStatus === 'UNRECORDED'
                            ? 'bg-gray-200 border-gray-400 text-gray-800 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200 shadow-xs'
                            : 'bg-white dark:bg-[#111E1A] border-gray-200 dark:border-[#223A33] text-gray-500 dark:text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        <span>غير مسجل ○</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. العبادات والسنن */}
        {habitsToReview.length > 0 && (
          <div className="mb-6 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              العبادات والسنن
            </h4>
            <div className="space-y-2">
              {habitsToReview.map((h) => {
                const isDone = habitCompletedMap[h.habitKey] ?? h.isCompleted;
                const titleArabic = getHabitDisplayName(h.habitKey);

                return (
                  <div
                    key={h.habitKey}
                    id={`review_habit_${h.habitKey}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#182B25] border border-gray-200/80 dark:border-[#223A33]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {titleArabic}
                      </span>
                      {isDone ? (
                        <span className="text-[11px] text-[#1E8258] dark:text-[#A5DCCB] font-semibold">
                          (مسجلة كمنجزة)
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-400">
                          (غير مسجلة)
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleHabitChange(h.habitKey, true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                          isDone
                            ? 'bg-[#E6F6EE] border-[#1E8258] text-[#1E8258] dark:bg-[#164E3D]/60 dark:border-[#3DA384]'
                            : 'bg-white dark:bg-[#111E1A] border-gray-200 dark:border-[#223A33] text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        ✓ تم الإنجاز
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHabitChange(h.habitKey, false)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                          !isDone
                            ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200'
                            : 'bg-white dark:bg-[#111E1A] border-gray-200 dark:border-[#223A33] text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        لم أقم بها
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. الأذكار والسبحة (إذا رغب بتسجيل إنجازها خارج التطبيق) */}
        {allCounters.length > 0 && (
          <div className="mb-6 space-y-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              الأذكار والتسبيحات
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allCounters.slice(0, 4).map((c) => {
                const isDone = counterCompletedMap[c.counterKey] || false;
                const titleArabic = getCounterDisplayName(c.counterKey);

                return (
                  <button
                    key={c.counterKey}
                    type="button"
                    onClick={() => handleCounterToggle(c.counterKey)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                      isDone
                        ? 'bg-[#E6F6EE] border-[#1E8258] text-[#1E8258] dark:bg-[#164E3D]/40 dark:border-[#3DA384]'
                        : 'bg-gray-50 dark:bg-[#182B25] border-gray-200 dark:border-[#223A33] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-xs font-semibold">{titleArabic}</span>
                    <span className="text-[11px] font-bold">
                      {isDone ? '✓ تم الإنجاز' : '+ تسجيل كمنجز'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Confirm Button */}
        <button
          id="confirm_yesterday_review_btn"
          type="button"
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl bg-[#28876B] hover:bg-[#1E6B54] text-white font-bold text-base shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <CheckCircle2 className="w-5 h-5" />
          حفظ المراجعة ✓
        </button>
      </div>
    </div>
  );
};
