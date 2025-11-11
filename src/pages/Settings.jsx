import React from 'react';
import { useSettings } from '../context/SettingsContext';

const Settings = () => {
  const { settings, updateSetting, resetSettings } = useSettings();

  const onSave = () => {
    alert('Settings saved');
  };
  const onReset = () => {
    resetSettings();
  };

  return (
    <main className="ml-64 mt-20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Home › Settings</p>
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
                  <option>Light (default)</option>
                  <option>Dark</option>
                  <option>System</option>
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
            </div>
          </div>
        </div>

        {/* Analytics & Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-semibold mb-4">Analytics & Reports</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">SLA Threshold (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={settings.slaThreshold}
                  onChange={(e) => updateSetting('slaThreshold', Number(e.target.value) || 0)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Resolution Source</label>
                <div className="flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={settings.useTimestampResolution}
                      onChange={() => updateSetting('useTimestampResolution', true)}
                    />
                    Timestamps (resolved_at - created_at)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!settings.useTimestampResolution}
                      onChange={() => updateSetting('useTimestampResolution', false)}
                    />
                    processing_time_minutes
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Department Chart Scope</label>
                <select
                  value={settings.deptChartScope}
                  onChange={(e) => updateSetting('deptChartScope', e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="all">All data</option>
                  <option value="filtered">Filtered view</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Settings;
