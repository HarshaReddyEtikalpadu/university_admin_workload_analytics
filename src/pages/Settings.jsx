import React from 'react';
import { useSettings } from '../context/SettingsContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useData } from '../context/DataContext';
import { useFilters } from '../hooks/useFilters';

const Settings = () => {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { data } = useData();
  const { filters, updateFilter, resetFilters } = useFilters(data?.requests || [], null);

  const onSave = () => {
    alert('Settings saved');
  };
  const onReset = () => {
    resetSettings();
  };

  const handleNavigate = (dest) => {
    if (dest === 'settings') return;
    const sections = ['dashboard', 'analytics', 'recommendations', 'tasks', 'reports', 'team', 'calendar'];
    if (sections.includes(dest)) {
      try { sessionStorage.setItem('scrollToSection', dest); } catch {}
      window.location.assign('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} onSearch={(q) => updateFilter('search', q)} onNavigate={handleNavigate} onLogout={() => window.location.assign('/login')} />
      <Sidebar user={{ name: 'Settings', role: 'analyst' }} filters={filters} onFilterChange={updateFilter} onResetFilters={resetFilters} onNavigate={handleNavigate} activeSection={'settings'} />
      <main className="ml-64 mt-20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Home &gt; Settings</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onSave} className="px-4 py-2 rounded-full bg-gray-900 text-white">Save Changes</button>
              <button onClick={onReset} className="px-4 py-2 rounded-full bg-gray-100">Reset</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appearance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Theme</label>
                  <select value={settings.theme} onChange={(e) => updateSetting('theme', e.target.value)} className="w-full border rounded-md px-3 py-2">
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Accent Color</label>
                  <select value={settings.accent} onChange={(e) => updateSetting('accent', e.target.value)} className="w-full border rounded-md px-3 py-2">
                    <option>Green</option>
                    <option>Blue</option>
                    <option>Purple</option>
                    <option>Orange</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Density</label>
                  <select value={settings.density} onChange={(e) => updateSetting('density', e.target.value)} className="w-full border rounded-md px-3 py-2">
                    <option>Comfortable</option>
                    <option>Compact</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span>Rounded Cards</span>
                  <input type="checkbox" checked={settings.roundedCards} onChange={(e) => updateSetting('roundedCards', e.target.checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show gridlines in charts</span>
                  <input type="checkbox" checked={settings.gridlines} onChange={(e) => updateSetting('gridlines', e.target.checked)} />
                </div>
                <p className="text-xs text-gray-500">These settings affect header, sidebar, cards, and charts.</p>
              </div>
            </div>

            {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>Daily summary email</span>
                <input type="checkbox" checked={settings.dailyEmail} onChange={(e) => updateSetting('dailyEmail', e.target.checked)} />
              </label>
              <label className="flex items-center justify-between">
                <span>Weekly PDF report</span>
                <input type="checkbox" checked={settings.weeklyPdf} onChange={(e) => updateSetting('weeklyPdf', e.target.checked)} />
              </label>
              <label className="flex items-center justify-between">
                <span>Real-time anomaly alerts</span>
                <input type="checkbox" checked={settings.realtimeAlerts} onChange={(e) => updateSetting('realtimeAlerts', e.target.checked)} />
              </label>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const ok = await window.Notification?.requestPermission?.();
                      alert(ok === 'granted' ? 'Browser notifications enabled.' : 'Permission was not granted.');
                    } catch {
                      alert('Your browser does not support Notification API.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-md bg-primary-blue text-white text-sm"
                >
                  Enable Browser Notifications
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (window.Notification && Notification.permission === 'granted') {
                        new Notification('Test Notification', { body: 'This is a test message.' });
                      } else {
                        alert('Notifications not granted. Click Enable first.');
                      }
                    } catch {
                      alert('Notifications not supported in this browser.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-md bg-gray-100 text-sm"
                >
                  Send Test
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quiet Hours (from)</label>
                  <input type="time" value={settings.quietStart} onChange={(e) => updateSetting('quietStart', e.target.value)} className="w-full border rounded-md px-3 py-2" />
                </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">to</label>
                    <input type="time" value={settings.quietEnd} onChange={(e) => updateSetting('quietEnd', e.target.value)} className="w-full border rounded-md px-3 py-2" />
                  </div>
                </div>
                <p className="text-xs text-gray-500">No push alerts during quiet hours.</p>

                {/* EmailJS (optional) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">EmailJS (optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Service ID</label>
                      <input
                        type="text"
                        value={settings.emailjsService || ''}
                        onChange={(e) => updateSetting('emailjsService', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="e.g., service_xxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Template ID</label>
                      <input
                        type="text"
                        value={settings.emailjsTemplate || ''}
                        onChange={(e) => updateSetting('emailjsTemplate', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="e.g., template_xxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Public Key</label>
                      <input
                        type="text"
                        value={settings.emailjsPublicKey || ''}
                        onChange={(e) => updateSetting('emailjsPublicKey', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="e.g., a1b2c3..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={settings.emailRecipient || ''}
                        onChange={(e) => updateSetting('emailRecipient', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-md bg-primary-blue text-white text-sm"
                      onClick={async () => {
                        try {
                          if (!window.emailjs) {
                            alert('EmailJS SDK not found on window.emailjs');
                            return;
                          }
                          if (!settings.emailjsService || !settings.emailjsTemplate || !settings.emailjsPublicKey || !settings.emailRecipient) {
                            alert('Please fill Service ID, Template ID, Public Key, and Recipient Email.');
                            return;
                          }
                          // Minimal test payload
                          await window.emailjs.send(
                            settings.emailjsService,
                            settings.emailjsTemplate,
                            { to_email: settings.emailRecipient, subject: 'Weekly Report (manual)', message: 'Triggered from Settings.' },
                            settings.emailjsPublicKey
                          );
                          alert('Weekly report email sent via EmailJS.');
                        } catch (e) {
                          console.warn(e);
                          alert('Email send failed; check console for details.');
                        }
                      }}
                    >
                      Send Weekly Report now
                    </button>
                    <span className="text-xs text-gray-500">Requires EmailJS SDK and valid credentials.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics & Reports removed per request */}
        </div>
      </main>
    </div>
  );
};

export default Settings;
