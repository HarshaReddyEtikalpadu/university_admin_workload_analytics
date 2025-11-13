// Lightweight notification helpers and simple schedulers (front-end only)

let scheduled = { daily: null, weekly: null, dailyExport: null, weeklyEmail: null };

export const withinQuietHours = (settings, d = new Date()) => {
  try {
    const toMin = (s) => {
      const [hh, mm] = String(s || '00:00').split(':').map((n) => parseInt(n, 10) || 0);
      return hh * 60 + mm;
    };
    const start = toMin(settings?.quietStart);
    const end = toMin(settings?.quietEnd);
    const cur = d.getHours() * 60 + d.getMinutes();
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    return start <= end ? (cur >= start && cur < end) : (cur >= start || cur < end);
  } catch {
    return false;
  }
};

export const requestBrowserPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    try {
      const p = await Notification.requestPermission();
      return p === 'granted';
    } catch {
      return false;
    }
  }
  return false;
};

export const notify = async ({ title, body }) => {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title || 'Notification', { body });
      return true;
    }
  } catch {}
  try {
    // Fallback — non-blocking toast-like alert
    console.log('[notify]', title, body);
  } catch {}
  return false;
};

const clearTimer = (t) => { try { if (t) clearTimeout(t); } catch {} };

export const cancelSchedules = () => {
  clearTimer(scheduled.daily); scheduled.daily = null;
  clearTimer(scheduled.weekly); scheduled.weekly = null;
  clearTimer(scheduled.dailyExport); scheduled.dailyExport = null;
  clearTimer(scheduled.weeklyEmail); scheduled.weeklyEmail = null;
};

const nextTimeTodayOrTomorrow = (h = 9, m = 0) => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next;
};

const nextWeekdayAt = (weekday = 1, h = 9, m = 0) => {
  // weekday: 0 Sun .. 6 Sat
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  const delta = (weekday + 7 - now.getDay()) % 7;
  if (delta === 0 && next <= now) next.setDate(next.getDate() + 7);
  else next.setDate(next.getDate() + delta);
  return next;
};

export const scheduleDailySummary = (settings, getSummaryText) => {
  clearTimer(scheduled.daily);
  if (!settings?.dailyEmail) return;
  const run = async () => {
    if (!withinQuietHours(settings)) {
      const text = (await getSummaryText?.()) || 'Daily summary is ready.';
      await notify({ title: 'Daily Summary', body: text });
    }
    scheduled.daily = setTimeout(run, 24 * 60 * 60 * 1000);
  };
  const target = nextTimeTodayOrTomorrow(9, 0); // 09:00 local
  scheduled.daily = setTimeout(run, target.getTime() - Date.now());
};

export const scheduleWeeklyReport = (settings, getReportText) => {
  clearTimer(scheduled.weekly);
  if (!settings?.weeklyPdf) return;
  const run = async () => {
    if (!withinQuietHours(settings)) {
      const text = (await getReportText?.()) || 'Weekly report is ready.';
      await notify({ title: 'Weekly Report', body: text });
    }
    // schedule next week
    const n = nextWeekdayAt(1, 9, 0); // Monday 09:00
    scheduled.weekly = setTimeout(run, n.getTime() - Date.now());
  };
  const target = nextWeekdayAt(1, 9, 0);
  scheduled.weekly = setTimeout(run, target.getTime() - Date.now());
};

// CSV helpers
export const downloadCSV = (filename, rows) => {
  try {
    const escape = (v) => {
      const s = (v ?? '').toString().replace(/"/g, '""');
      const needs = s.includes('"') || s.includes(',') || s.includes('\n');
      return needs ? `"${s}"` : s;
    };
    const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    console.warn('downloadCSV failed', e);
    return false;
  }
};

export const scheduleDailyExport = (settings, getRows) => {
  clearTimer(scheduled.dailyExport);
  if (!settings?.dailyEmail) return;
  const run = async () => {
    try {
      if (!withinQuietHours(settings)) {
        const rows = (await getRows?.()) || [];
        if (rows.length) {
          const date = new Date();
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          downloadCSV(`daily_export_${yyyy}-${mm}-${dd}.csv`, rows);
          await notify({ title: 'Daily CSV Export', body: 'Downloaded daily filtered dataset.' });
        }
      }
    } finally {
      scheduled.dailyExport = setTimeout(run, 24 * 60 * 60 * 1000);
    }
  };
  const target = nextTimeTodayOrTomorrow(9, 5); // 09:05
  scheduled.dailyExport = setTimeout(run, target.getTime() - Date.now());
};

// EmailJS (optional) weekly send
export const scheduleWeeklyEmail = (settings, getPayload) => {
  clearTimer(scheduled.weeklyEmail);
  if (!settings?.weeklyPdf) return;
  const run = async () => {
    try {
      if (!withinQuietHours(settings)) {
        if (window.emailjs && settings.emailjsService && settings.emailjsTemplate && settings.emailjsPublicKey && settings.emailRecipient) {
          const payload = (await getPayload?.()) || { subject: 'Weekly report', message: 'Your weekly report is ready.', csv: '' };
          try {
            await window.emailjs.send(
              settings.emailjsService,
              settings.emailjsTemplate,
              { to_email: settings.emailRecipient, subject: payload.subject, message: payload.message, csv: payload.csv },
              settings.emailjsPublicKey
            );
            await notify({ title: 'Weekly Report', body: 'Report emailed via EmailJS.' });
          } catch (e) {
            console.warn('EmailJS send failed', e);
            await notify({ title: 'Weekly Report', body: 'Email send failed; see console.' });
          }
        } else {
          await notify({ title: 'Weekly Report', body: 'Weekly report available.' });
        }
      }
    } finally {
      const n = nextWeekdayAt(1, 9, 10); // next Monday 09:10
      scheduled.weeklyEmail = setTimeout(run, n.getTime() - Date.now());
    }
  };
  const target = nextWeekdayAt(1, 9, 10);
  scheduled.weeklyEmail = setTimeout(run, target.getTime() - Date.now());
};

