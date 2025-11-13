import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { requestBrowserPermission, scheduleDailySummary, scheduleWeeklyReport, cancelSchedules } from '../utils/notifications';

const DEFAULTS = {
  theme: 'Light',
  accent: 'Green',
  density: 'Comfortable',
  roundedCards: true,
  gridlines: false,
  dailyEmail: true,
  weeklyPdf: false,
  realtimeAlerts: true,
  quietStart: '21:00',
  quietEnd: '07:00',
  slaThreshold: 60,
  useTimestampResolution: true,
  deptChartScope: 'filtered', // 'filtered' | 'all'
  // EmailJS (optional)
  emailjsService: '',
  emailjsTemplate: '',
  emailjsPublicKey: '',
  emailRecipient: '',
};

const SettingsContext = createContext({ settings: DEFAULTS });

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('dashboardSettings');
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    } catch {}
    // Apply simple global class for rounded cards
    const root = document.documentElement;
    if (settings.roundedCards) {
      root.classList.add('rounded-cards');
    } else {
      root.classList.remove('rounded-cards');
    }

    // Apply theme/accent/density to root for CSS to consume
    try {
      const accentMap = {
        Green: '#10B981',
        Blue: '#3B82F6',
        Purple: '#8B5CF6',
        Orange: '#F59E0B',
      };
      const density = (settings.density || 'Comfortable').toLowerCase();
      const themeRaw = (settings.theme || '').toLowerCase();
      const theme = themeRaw.includes('dark') ? 'dark' : 'light';
      root.style.setProperty('--accent', accentMap[settings.accent] || '#3B82F6');
      root.setAttribute('data-density', density);
      root.setAttribute('data-theme', theme);
    } catch {}
  }, [settings]);

  // Ask for permission proactively when toggles are on
  useEffect(() => {
    if (settings.dailyEmail || settings.weeklyPdf || settings.realtimeAlerts) {
      requestBrowserPermission().catch(() => {});
    }
  }, [settings.dailyEmail, settings.weeklyPdf, settings.realtimeAlerts]);

  const updateSetting = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const resetSettings = () => setSettings(DEFAULTS);

  const value = useMemo(() => ({ settings, updateSetting, resetSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
