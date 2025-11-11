import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEFAULTS = {
  theme: 'Light (default)',
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
  }, [settings]);

  const updateSetting = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const resetSettings = () => setSettings(DEFAULTS);

  const value = useMemo(() => ({ settings, updateSetting, resetSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
