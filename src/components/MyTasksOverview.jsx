import React, { useMemo } from 'react';

const formatCount = (n) => (Number(n) || 0).toLocaleString();

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();
const isInCurrentWeek = (date) => {
  const now = new Date();
  const start = new Date(now);
  const day = start.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
};

const MyTasksOverview = ({ requests = [], user }) => {
  const metrics = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const asDate = (v) => (v ? new Date(v) : null);
    const isPending = (s) => String(s) === 'Pending';
    const isCompleted = (s) => s === 'Approved' || s === 'Resolved';

    const assignedToUser = requests.filter((r) => Number(r.assigned_admin_id) === user?.adminId);
    const visible = requests; // already filtered upstream by role
    const base = user?.role === 'admin' ? assignedToUser : visible;

    const dueToday = base.filter((r) => {
      if (!isPending(r.status)) return false;
      const created = asDate(r.created_at);
      return created && isSameDay(created, now);
    });

    const overdue = base.filter((r) => {
      if (!isPending(r.status)) return false;
      const created = asDate(r.created_at);
      return created && created < sevenDaysAgo;
    });

    const highPriority = base.filter((r) => ['High', 'Critical'].includes(r.priority));

    const completedThisWeek = base.filter((r) => {
      if (!isCompleted(r.status)) return false;
      const resolved = asDate(r.resolved_at) || asDate(r.created_at);
      return resolved && isInCurrentWeek(resolved);
    });

    const awaitingApproval = base.filter((r) => isPending(r.status));

    return {
      assigned: base.length,
      dueToday: dueToday.length,
      overdue: overdue.length,
      highPriority: highPriority.length,
      completedThisWeek: completedThisWeek.length,
      awaitingApproval: awaitingApproval.length,
    };
  }, [requests, user]);

  const cards = [
    { title: 'Assigned to Me', value: metrics.assigned, accent: 'text-gray-800' },
    { title: 'Due Today', value: metrics.dueToday, accent: 'text-red-600' },
    { title: 'Overdue', value: metrics.overdue, accent: 'text-red-600' },
    { title: 'High Priority', value: metrics.highPriority, accent: 'text-yellow-600' },
    { title: 'Completed This Week', value: metrics.completedThisWeek, accent: 'text-green-600' },
    { title: 'Awaiting Approval', value: metrics.awaitingApproval, accent: 'text-blue-600' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
          <p className="text-sm text-gray-500">Home › My Tasks</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">Last updated: just now</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border border-gray-200 shadow-xs p-4 bg-white">
            <div className="text-sm text-gray-600 mb-2">{c.title}</div>
            <div className={`text-4xl font-semibold ${c.accent}`}>{formatCount(c.value)}</div>
            <div className="text-xs text-gray-400 mt-1">—</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasksOverview;
