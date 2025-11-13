import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';

const CalendarPage = ({ requests = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Count requests per day for the currently visible month
  const calendarData = useMemo(() => {
    const norm = (s) => String(s || '').trim().toLowerCase();
    const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; // stable, avoids TZ shifts
    const daily = {};
    (requests || []).forEach((req) => {
      if (!req?.created_at) return;
      const d = new Date(req.created_at);
      if (isNaN(d)) return;
      const key = keyOf(d);
      if (!daily[key]) {
        daily[key] = { total: 0, status: { approved: 0, rejected: 0, resolved: 0, pending: 0 } };
      }
      daily[key].total += 1;
      const st = norm(req.status);
      if (st === 'approved') daily[key].status.approved += 1;
      else if (st === 'rejected') daily[key].status.rejected += 1;
      else if (st === 'resolved') daily[key].status.resolved += 1;
      else if (st === 'pending') daily[key].status.pending += 1;
    });
    return daily;
  }, [requests]);

  // Deduce available months from dataset
  const monthBounds = useMemo(() => {
    let min = null, max = null;
    (requests || []).forEach((r) => {
      if (!r?.created_at) return;
      const d = new Date(r.created_at);
      if (isNaN(d)) return;
      const m = new Date(d.getFullYear(), d.getMonth(), 1);
      if (!min || m < min) min = m;
      if (!max || m > max) max = m;
    });
    return { min, max };
  }, [requests]);

  const availableMonths = useMemo(() => {
    const arr = [];
    if (!monthBounds.min || !monthBounds.max) return arr;
    let cur = new Date(monthBounds.min);
    while (cur <= monthBounds.max) {
      arr.push(new Date(cur));
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return arr;
  }, [monthBounds]);

  // Clamp initial view into data range
  React.useEffect(() => {
    const { min, max } = monthBounds;
    if (!min || !max) return;
    const now = new Date();
    const nowStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (nowStart < min) setCurrentDate(min);
    else if (nowStart > max) setCurrentDate(max);
    else setCurrentDate(nowStart);
  }, [monthBounds.min, monthBounds.max]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const dayReqs = (requests || []).filter((r) => {
      if (!r?.created_at) return false;
      const d = new Date(r.created_at);
      if (isNaN(d)) return false;
      return d.toDateString() === selectedDate.toDateString();
    });

    const byDept = {};
    const byHour = {};
    let approved = 0, rejected = 0, resolved = 0, pending = 0;
    const norm = (s) => String(s || '').trim().toLowerCase();
    dayReqs.forEach((r) => {
      const d = new Date(r.created_at);
      const dept = r.department_name || r.department || 'Unknown';
      const hour = d.getHours();
      byDept[dept] = (byDept[dept] || 0) + 1;
      byHour[hour] = (byHour[hour] || 0) + 1;
      const st = norm(r.status);
      if (st === 'approved') approved += 1;
      else if (st === 'rejected') rejected += 1;
      else if (st === 'resolved') resolved += 1;
      else if (st === 'pending') pending += 1;
    });

    const peakHour = Object.entries(byHour).reduce((best, entry) => {
      const [, count] = entry;
      if (!best) return entry;
      return count > best[1] ? entry : best;
    }, null);

    return {
      total: dayReqs.length,
      byDept,
      peakHour: peakHour ? `${peakHour[0]}:00` : 'N/A',
      peakCount: peakHour ? peakHour[1] : 0,
      status: { approved, rejected, resolved, pending },
    };
  }, [selectedDate, requests]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    const keyOf = (dt) => `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const info = calendarData[keyOf(date)] || { total: 0, status: { approved: 0, rejected: 0, resolved: 0, pending: 0 } };
      days.push({ date, count: info.total, status: info.status });
    }
    return days;
  };

  const days = generateCalendar();

  const getWorkloadColor = (count) => {
    if (count === 0) return 'bg-gray-50';
    if (count <= 30) return 'bg-green-100 text-green-800';
    if (count <= 45) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Safe emoji helper
  const getEmoji = (count) => {
    if (count === 0) return '';
    if (count <= 30) return '🟢';
    if (count <= 45) return '🟡';
    return '🔴';
  };

  const getWorkloadEmoji = (count) => {
    if (count === 0) return '';
    if (count <= 30) return '🟢';
    if (count <= 45) return '🟡';
    return '🔴';
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-2xl font-bold text-gray-900">Calendar View</h2>
        <p className="text-sm text-gray-500">Home &gt; Calendar</p>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40"
            aria-label="Previous month"
            disabled={monthBounds.min && new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) <= monthBounds.min}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          {availableMonths.length > 0 && (
            <select
              className="px-3 py-2 border rounded-lg text-sm"
              value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map((v) => parseInt(v, 10));
                setSelectedDate(null);
                setCurrentDate(new Date(y, m - 1, 1));
              }}
            >
              {availableMonths.map((d) => (
                <option key={`${d.getFullYear()}-${d.getMonth()}`} value={`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`}>
                  {monthNames[d.getMonth()]} {d.getFullYear()}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-40"
            aria-label="Next month"
            disabled={monthBounds.max && new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) >= monthBounds.max}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
          {days.map((day, idx) => (
            <div
              key={idx}
              onClick={() => day && setSelectedDate(day.date)}
              className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all ${day ? getWorkloadColor(day.count) : 'bg-gray-50 cursor-default'} ${selectedDate?.toDateString() === day?.date?.toDateString() ? 'ring-2 ring-blue-500' : ''} ${day ? 'hover:shadow-md' : ''}`}
              title={day && day.count > 0 ? `Total: ${day.count}\nApproved: ${day.status.approved}  Rejected: ${day.status.rejected}\nResolved: ${day.status.resolved}  Pending: ${day.status.pending}` : ''}
            >
              {day && (
                <>
                  <div className="font-semibold text-lg">{day.date.getDate()}</div>
                  {day.count > 0 && (
                    <div className="mt-1">
                      <div className="text-xs font-semibold">{day.count} requests</div>
                      <div className="text-lg">{getEmoji(day.count)}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span>Low (0-30)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span>Medium (31-45)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span>High (46+)</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDayData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold mb-4">
            Details for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <CalendarIcon size={20} />
                <span className="font-semibold">Total Requests</span>
              </div>
              <div className="text-3xl font-bold text-blue-900">{selectedDayData.total}</div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-blue-900">
                <div>Approved: <span className="font-semibold">{selectedDayData.status.approved}</span></div>
                <div>Rejected: <span className="font-semibold">{selectedDayData.status.rejected}</span></div>
                <div>Resolved: <span className="font-semibold">{selectedDayData.status.resolved}</span></div>
                <div>Pending: <span className="font-semibold">{selectedDayData.status.pending}</span></div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 text-purple-800 mb-2">
                <Clock size={20} />
                <span className="font-semibold">Peak Hour</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">{selectedDayData.peakHour}</div>
              <div className="text-sm text-purple-700">{selectedDayData.peakCount} requests</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <AlertCircle size={20} />
                <span className="font-semibold">Top Department</span>
              </div>
              <div className="text-lg font-bold text-green-900">
                {Object.entries(selectedDayData.byDept).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </div>
              <div className="text-sm text-green-700">
                {Object.entries(selectedDayData.byDept).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} requests
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Requests by Department:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(selectedDayData.byDept).map(([dept, count]) => (
                <div key={dept} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{dept}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
