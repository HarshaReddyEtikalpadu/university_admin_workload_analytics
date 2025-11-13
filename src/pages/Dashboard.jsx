import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  Users,
  Award,
  Search
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import PieChartComponent from '../components/Charts/PieChartComponent';
import BarChartComponent from '../components/Charts/BarChartComponent';
import LineChartComponent from '../components/Charts/LineChartComponent';
import HeatmapTable from '../components/Charts/HeatmapTable';
import CalendarPage from './CalendarPage';
import DataTable from '../components/DataTable';
import MyTasksOverview from '../components/MyTasksOverview';
import AnalysisSection from '../components/AnalysisSection';
import { useFilters } from '../hooks/useFilters';
import { useSettings } from '../context/SettingsContext';
import {
  calculateKPIs,
  getRequestTypeData,
  getAvgTimeByType,
  getTrendData,
  getHeatmapData,
  getDescriptiveStats,
  getSLACompliance,
  getAvgResolutionMinutes,
  getMonthlyVolume,
  getMonthlyCost,
} from '../utils/calculations';
import { applyAllFilters } from '../utils/filters';
import { withinQuietHours, notify, scheduleDailyExport, scheduleWeeklyEmail, downloadCSV } from '../utils/notifications';

const Dashboard = ({ user, data, onLogout }) => {
  const { filters, filteredRequests, updateFilter, resetFilters } = useFilters(data?.requests || [], user);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const activeLockRef = useRef(0); // temporarily lock active section after programmatic navigation

  const sectionRefs = {
    dashboard: useRef(null),
    analytics: useRef(null),
    recommendations: useRef(null),
    tasks: useRef(null),
    reports: useRef(null),
    team: useRef(null),
    calendar: useRef(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Avoid flipping highlight immediately after a manual navigate
        if (Date.now() < activeLockRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { root: null, rootMargin: '0px 0px -60% 0px', threshold: [0.2, 0.4, 0.6] }
    );
    Object.keys(sectionRefs).forEach((key) => {
      const el = sectionRefs[key].current;
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNavigate = (dest) => {
    if (dest === 'settings') return navigate('/settings');
    const scrollKeys = ['dashboard', 'analytics', 'recommendations', 'tasks', 'reports', 'team', 'calendar'];
    if (scrollKeys.includes(dest)) {
      const el = sectionRefs[dest]?.current;
      if (el) {
        activeLockRef.current = Date.now() + 1200; // lock for ~1.2s
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSection(dest);
      }
    }
  };

  // If another page asked us to scroll to a section, handle it once on mount
  useEffect(() => {
    try {
      const target = sessionStorage.getItem('scrollToSection');
      if (target && sectionRefs[target]?.current) {
        setTimeout(() => {
          activeLockRef.current = Date.now() + 1200;
          sectionRefs[target].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(target);
        }, 0);
      }
      sessionStorage.removeItem('scrollToSection');
    } catch {}
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate all metrics
  const kpis = useMemo(() => {
    return calculateKPIs(filteredRequests);
  }, [filteredRequests]);

  // Analytics (pie/bar/line/heatmap) should ignore Department filter but respect Date Range and others
  const analyticsRequests = useMemo(() => {
    const noDeptFilters = { ...filters, department: 'All' };
    return applyAllFilters(data?.requests || [], user, noDeptFilters);
  }, [data?.requests, user, filters]);

  // Build 12-month workload trend
  const trendData = useMemo(() => {
    const now = new Date();
    const targetYear = (filters?.dateRange === 'Last year') ? now.getFullYear() - 1 : now.getFullYear();
    const baseFilters = { ...filters, dateRange: 'All', dateStart: '', dateEnd: '' };
    const scoped = applyAllFilters(data?.requests || [], user, baseFilters) || [];
    const buckets = Array.from({ length: 12 }, (_, i) => ({ month: new Date(targetYear, i, 1).toLocaleString('en-US', { month: 'short' }), requests: 0 }));
    scoped.forEach((r) => {
      if (!r.created_at) return; const d = new Date(r.created_at); if (isNaN(d) || d.getFullYear() !== targetYear) return; buckets[d.getMonth()].requests += 1;
    });
    return buckets;
  }, [data?.requests, user, filters]);

  const chartData = useMemo(() => ({
    pieData: getRequestTypeData(analyticsRequests),
    barData: getAvgTimeByType(analyticsRequests),
    trendData,
    heatmapData: getHeatmapData(filteredRequests),
  }), [analyticsRequests, filteredRequests, trendData]);

  const stats = useMemo(() => {
    return getDescriptiveStats(filteredRequests);
  }, [filteredRequests]);

  // Daily CSV export and weekly email schedule (front-end only, while app is open)
  useEffect(() => {
    // Schedule daily export of filtered rows (as CSV)
    scheduleDailyExport(settings, async () => {
      // Build rows: simple export of key fields
      const headers = ['request_id','department_name','request_type','status','processing_time_minutes','created_at'];
      const rows = [headers];
      (filteredRequests || []).forEach((r) => rows.push([
        r.request_id,
        r.department_name || r.department || '',
        r.request_type || '',
        r.status || '',
        r.processing_time_minutes ?? '',
        r.created_at || '',
      ]));
      return rows;
    });

    // Schedule weekly email via EmailJS if configured
    scheduleWeeklyEmail(settings, async () => {
      // Include a small CSV inline in the email params
      const headers = ['Department','Status','Count'];
      const by = {};
      (filteredRequests || []).forEach((r) => {
        const k = `${r.department_name || r.department || 'Unknown'}|${r.status || ''}`;
        by[k] = (by[k] || 0) + 1;
      });
      const rows = [headers];
      Object.entries(by).forEach(([k,v]) => {
        const [dept, status] = k.split('|');
        rows.push([dept, status, v]);
      });
      const csvText = rows.map((r) => r.map((c) => String(c)).join(',')).join('\n');
      return { subject: 'Weekly Workload Report', message: 'Attached CSV content in message body.', csv: csvText };
    });
  }, [filteredRequests, settings]);

  // Realtime anomaly watcher (pending surge or high error rate)
  useEffect(() => {
    if (!settings.realtimeAlerts) return;
    let last = { pending: 0, errorRate: 0 };
    let mounted = true;
    const tick = async () => {
      if (!mounted) return;
      try {
        const k = calculateKPIs(filteredRequests || []);
        const surge = last.pending > 0 ? ((k.pendingRequests - last.pending) / last.pending) : 0;
        const highError = k.errorRate >= 15; // 15% threshold
        const pendingJump = k.pendingRequests >= 10 && surge >= 0.2; // +20% and at least 10 pending
        if (!withinQuietHours(settings) && (pendingJump || highError)) {
          const body = pendingJump
            ? `Pending surged to ${k.pendingRequests} (+${(surge*100).toFixed(0)}%).`
            : `Error rate high: ${k.errorRate}%`;
          await notify({ title: 'Anomaly detected', body });
        }
        last = { pending: k.pendingRequests, errorRate: k.errorRate };
      } catch {}
      finally {
        setTimeout(tick, 60 * 1000);
      }
    };
    tick();
    return () => { mounted = false; };
  }, [filteredRequests, settings]);

  // Reports KPIs and charts
  const reportKpis = useMemo(() => ({
    sla: getSLACompliance(filteredRequests, Number(settings.slaThreshold) || 60, !!settings.useTimestampResolution),
    avgResMins: getAvgResolutionMinutes(filteredRequests, !!settings.useTimestampResolution),
    monthlyVolume: getMonthlyVolume(filteredRequests),
    monthlyCost: getMonthlyCost(filteredRequests, data?.admins || [], 25, !!settings.useTimestampResolution),
  }), [filteredRequests, data, settings.slaThreshold, settings.useTimestampResolution]);

  const reportsStatusPie = useMemo(() => {
    const by = { Approved: 0, Rejected: 0, Pending: 0, Resolved: 0 };
    filteredRequests.forEach(r => { by[r.status] = (by[r.status] || 0) + 1; });
    return Object.entries(by).map(([name, value]) => ({ name, value }));
  }, [filteredRequests]);

  const reportsDeptBar = useMemo(() => {
    const source = settings.deptChartScope === 'all' ? (data?.requests || []) : (filteredRequests || []);
    const counts = new Map();
    source.forEach((r) => {
      const k = r.department_name || r.department || 'Unknown';
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [data, filteredRequests, settings.deptChartScope]);

  const handleSearch = (query) => {
    updateFilter('search', query);
  };

  // ---------------- Team section state and metrics ----------------
  const [teamSearch, setTeamSearch] = useState('');
  const [teamDept, setTeamDept] = useState('All');

  const teamStats = useMemo(() => {
    const admins = data?.admins || [];
    // Use globally filtered requests so date range and other filters apply
    const reqs = filteredRequests || [];

    const norm = (s) => (s ? String(s).trim().toLowerCase() : '');
    const matchAdmin = (r, a) => {
      const idR = Number(r.assigned_admin_id) || 0;
      const idA = Number(a.admin_id) || 0;
      if (idR && idA && idR === idA) return true;
      const nameR = norm(r.assigned_admin_name);
      const nameA = norm(a.admin_name || a.name);
      if (nameR && nameA && nameR === nameA) return true;
      const emailR = norm(r.assigned_admin_email || r.email);
      const emailA = norm(a.email);
      if (emailR && emailA && emailR === emailA) return true;
      return false;
    };

    return admins.map((admin) => {
      const adminTasks = reqs.filter((r) => matchAdmin(r, admin));
      const statusNorm = (s) => String(s ?? '').trim().toLowerCase();
      // "Tasks Done" = all tasks whose status is not strictly "pending"
      const doneTasks = adminTasks.filter((r) => statusNorm(r.status) !== 'pending');
      const completedTasks = doneTasks.length;
      const totalTime = doneTasks.reduce((sum, r) => sum + (Number(r.processing_time_minutes) || 0), 0);
      const avgTime = completedTasks ? Math.round(totalTime / completedTasks) : 0;
      const errorTasks = adminTasks.filter((r) => (Number(r.error_count) || 0) > 0).length;
      const errorRate = adminTasks.length ? ((errorTasks / adminTasks.length) * 100) : 0;
      return {
        ...admin,
        tasksCompleted: completedTasks,
        avgProcessingTime: avgTime,
        errorRate: Number(errorRate.toFixed(1)),
        efficiencyScore: Number(admin.efficiency_score) || 4.0,
      };
    });
  }, [data, filteredRequests]);

  const teamDepartments = useMemo(() => {
    const set = new Set();
    (teamStats || []).forEach((a) => {
      if (a?.department_name) set.add(a.department_name);
    });
    return ['All', ...Array.from(set).sort()];
  }, [teamStats]);

  const filteredTeam = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    return (teamStats || []).filter((a) => {
      const matchesSearch = !term || (a?.admin_name || a?.name || '').toLowerCase().includes(term);
      const matchesDept = teamDept === 'All' || (a?.department_name === teamDept);
      return matchesSearch && matchesDept;
    });
  }, [teamStats, teamSearch, teamDept]);

  // Compute overview from the currently filtered team
  const topPerformer = useMemo(() => {
    return (filteredTeam || []).reduce((best, a) => (a.efficiencyScore > (best?.efficiencyScore || 0) ? a : best), null);
  }, [filteredTeam]);

  const needsSupport = useMemo(() => {
    const list = (filteredTeam || []).filter((a) => a.efficiencyScore < 4.0);
    return list;
  }, [filteredTeam]);

  const avgTeamEfficiency = useMemo(() => {
    const arr = filteredTeam || [];
    if (!arr.length) return 0;
    const total = arr.reduce((sum, a) => sum + (Number(a.efficiencyScore) || 0), 0);
    return Number((total / arr.length).toFixed(1));
  }, [filteredTeam]);

  const deptWorkload = useMemo(() => {
    const counts = new Map();
    (data?.requests || []).forEach((r) => {
      const k = r.department_name || r.department || 'Unknown';
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data?.requests]);

  // Export handled within DataTable now

  // Compute comparison label and previous-period metrics based on dateRange filter
  const getPrevFilters = () => {
    const f = { ...filters };
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const toISO = (d) => d.toISOString().slice(0, 10);
    const asDate = (s) => (s ? new Date(s) : null);

    let label = 'vs previous period';
    let start = null, end = null; // current window [start, end]

    switch (filters.dateRange) {
      case 'This month': {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        label = 'vs previous month';
        break;
      }
      case 'Last month': {
        const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        start = new Date(startOfCurrentMonth);
        start.setMonth(start.getMonth() - 1);
        end = new Date(startOfCurrentMonth);
        label = 'vs prior month';
        break;
      }
      case 'Last 7 days': {
        end = new Date(startOfToday); end.setDate(end.getDate() + 1);
        start = new Date(startOfToday); start.setDate(start.getDate() - 6);
        label = 'vs prior 7 days';
        break;
      }
      case 'Last 30 days': {
        end = new Date(startOfToday); end.setDate(end.getDate() + 1);
        start = new Date(startOfToday); start.setDate(start.getDate() - 29);
        label = 'vs prior 30 days';
        break;
      }
      case 'Last 3 months': {
        end = new Date(startOfToday); end.setDate(end.getDate() + 1);
        start = new Date(startOfToday); start.setMonth(start.getMonth() - 3);
        label = 'vs prior 3 months';
        break;
      }
      case 'Last 6 months': {
        end = new Date(startOfToday); end.setDate(end.getDate() + 1);
        start = new Date(startOfToday); start.setMonth(start.getMonth() - 6);
        label = 'vs prior 6 months';
        break;
      }
      case 'This year': {
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear() + 1, 0, 1);
        label = 'vs last year';
        break;
      }
      case 'Last year': {
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear(), 0, 1);
        label = 'vs the year before';
        break;
      }
      case 'Custom': {
        start = asDate(filters.dateStart);
        end = asDate(filters.dateEnd);
        if (end) { end = new Date(end); end.setDate(end.getDate() + 1); }
        const days = start && end ? Math.max(1, Math.round((end - start) / 86400000)) : 0;
        label = `vs prior ${days} days`;
        break;
      }
      default:
        return { prevFilters: null, label: 'vs last period' };
    }

    if (!start || !end) return { prevFilters: null, label };
    const durationDays = Math.max(1, Math.round((end - start) / 86400000));
    const prevEnd = new Date(start); // non-inclusive end
    const prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - durationDays);
    const pf = { ...f, dateRange: 'Custom', dateStart: toISO(prevStart), dateEnd: toISO(new Date(prevEnd.getTime() - 86400000)) };
    return { prevFilters: pf, label };
  };

  const { prevFilters, label: trendLabel } = getPrevFilters();
  const prevRequests = useMemo(() => {
    if (!prevFilters) return [];
    return applyAllFilters(data?.requests || [], user, prevFilters);
  }, [data, user, prevFilters]);

  const prevKpis = useMemo(() => calculateKPIs(prevRequests), [prevRequests]);

  // trends helper
  const getTrend = (current, previous) => {
     const base = previous || 0;
     if (base === 0) return { direction: 'neutral', value: '0.0' };
     const change = ((current - base) / base) * 100;
     return { direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral', value: Math.abs(change).toFixed(1) };
   };
 
  const metricCards = [
    {
      icon: FileText,
      label: 'Total Requests',
      value: kpis.totalRequests.toLocaleString(),
      trend: getTrend(kpis.totalRequests, prevKpis.totalRequests),
      trendLabel: trendLabel,
      iconColor: 'bg-blue-500',
    },
    {
      icon: Clock,
      label: 'Total Hours Spent',
      value: kpis.totalHours.toLocaleString(),
      trend: getTrend(kpis.totalHours, prevKpis.totalHours),
      trendLabel: trendLabel,
      iconColor: 'bg-purple-500',
    },
    {
      icon: DollarSign,
      label: 'Total Cost',
      value: `$${kpis.totalCost.toLocaleString()}`,
      trend: getTrend(kpis.totalCost, prevKpis.totalCost),
      trendLabel: trendLabel,
      iconColor: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Avg Processing Time',
      value: `${kpis.avgProcessingTime} min`,
      trend: getTrend(kpis.avgProcessingTime, prevKpis.avgProcessingTime),
      trendLabel: trendLabel,
      iconColor: 'bg-orange-500',
    },
    {
      icon: CheckCircle,
      label: 'Approval Rate',
      value: `${kpis.approvalRate}%`,
      trend: getTrend(kpis.approvalRate, prevKpis.approvalRate),
      trendLabel: trendLabel,
      iconColor: 'bg-green-500',
    },
    {
      icon: XCircle,
      label: 'Rejection Rate',
      value: `${kpis.rejectionRate}%`,
      trend: getTrend(kpis.rejectionRate, prevKpis.rejectionRate),
      trendLabel: trendLabel,
      iconColor: 'bg-red-500',
    },
    {
      icon: AlertCircle,
      label: 'Pending Requests',
      value: kpis.pendingRequests.toLocaleString(),
      trend: getTrend(kpis.pendingRequests, prevKpis.pendingRequests),
      trendLabel: trendLabel,
      iconColor: 'bg-yellow-500',
    },
    {
      icon: AlertTriangle,
      label: 'Error Rate',
      value: `${kpis.errorRate}%`,
      trend: getTrend(kpis.errorRate, prevKpis.errorRate),
      trendLabel: trendLabel,
      iconColor: 'bg-red-500',
    },
  ];

  useEffect(() => {
    // lightweight mount log; remove or refine if noisy
    console.log('[dashboard] data.source:', data?.source);
  }, [data?.source]);

  if (!data || !data.requests) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // derive unique department names from the incoming requests (use both possible field keys)
  const departmentOptions = useMemo(() => {
    const rows = data?.requests || [];
    const set = new Set();
    rows.forEach(r => {
      // try common field names used in CSVs: department_name or department
      const v = (r.department_name || r.department || '').toString().trim();
      if (v) set.add(v);
    });
    return Array.from(set).sort();
  }, [data?.requests]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} onSearch={handleSearch} onSearchScope={(scope) => updateFilter('searchScope', scope)} onNavigate={handleNavigate} />
      {/* pass real department values from CSV into Sidebar so dropdown reflects actual data */}
      <Sidebar
        user={user}
        filters={filters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onNavigate={handleNavigate}
        activeSection={activeSection}
        departments={departmentOptions}
      />
      
      <main className="ml-64 mt-20 p-4 md:p-6">
        {/* Small verification / status bar */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">Data source: <span className="font-medium">{data.source || 'unknown'}</span></div>
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">Visible requests: <span className="font-medium">{filteredRequests.length}</span></div>
            </div>
            <div />
          </div>
        </div>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Section A: KPI Metric Cards */}
          <section id="dashboard" ref={sectionRefs.dashboard}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricCards.map((card, index) => (
                <MetricCard
                  key={index}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  trend={card.trend.direction}
                  trendValue={card.trend.value}
                  trendLabel={card.trendLabel}
                  iconColor={card.iconColor}
                />
              ))}
            </div>
          </section>

          {/* Section B: Analytics */}
          <section id="analytics" ref={sectionRefs.analytics}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-sm text-gray-500">Home > Analytics</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PieChartComponent data={chartData.pieData} title="Requests by Type" />
              <BarChartComponent 
                data={chartData.barData} 
                title="Avg Processing Time by Type"
                xKey="name"
                yKey="value"
                xLabel="Request Type"
                yLabel="Avg Processing by Time"
                showGridlines={settings.gridlines}
                showLegend={false}
                horizontal
              />
              <LineChartComponent 
                data={chartData.trendData} 
                title="Workload Trend"
                xKey="month"
                yKey="requests"
                yLabel="Workload"
                showGridlines={settings.gridlines}
                showLegend={false}
              />
            </div>
          </section>

          {/* Section C: Heatmap Table */}
          <section>
            <HeatmapTable data={chartData.heatmapData} />
          </section>

          {/* Section D: Recommendations / Statistical Analysis */}
          <section id="recommendations" ref={sectionRefs.recommendations}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recommendations</h2>
              <p className="text-sm text-gray-500">Home > Recommendations</p>
            </div>
            <AnalysisSection stats={stats} requests={filteredRequests} />
          </section>

          {/* Section E: Tasks Overview + Data Table */}
          <section id="tasks" ref={sectionRefs.tasks}>
            <MyTasksOverview
              requests={filteredRequests}
              user={user}
            />
            <div className="h-4" />
            <DataTable data={filteredRequests} />
          </section>

          {/* Section F: Reports */}
          <section id="reports" ref={sectionRefs.reports}>
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
              <p className="text-sm text-gray-500">Home > Reports</p>
            </div>
            {/* KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="text-sm text-gray-500 mb-1">SLA Compliance</div>
                <div className="text-4xl font-bold text-gray-900">{reportKpis.sla}%</div>
                {/* trend placeholder intentionally removed */}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="text-sm text-gray-500 mb-1">Avg Resolution</div>
                <div className="text-4xl font-bold text-gray-900">{reportKpis.avgResMins} min</div>
                {/* trend placeholder intentionally removed */}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="text-sm text-gray-500 mb-1">Monthly Volume</div>
                <div className="text-4xl font-bold text-gray-900">{reportKpis.monthlyVolume.toLocaleString()}</div>
                {/* trend placeholder intentionally removed */}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="text-sm text-gray-500 mb-1">Monthly Cost</div>
                <div className="text-4xl font-bold text-gray-900">${reportKpis.monthlyCost?.toLocaleString?.() || reportKpis.monthlyCost}</div>
                {/* trend placeholder intentionally removed */}
              </div>
            </div>
            {/* Charts */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <PieChartComponent data={reportsStatusPie} title="Requests by Status" />
  <div>
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-base font-semibold text-gray-800">Requests by Department</h4>
    </div>
    <BarChartComponent data={reportsDeptBar} title="" showLegend={false} xKey="name" yKey="value" showGridlines={settings.gridlines} horizontal xLabel="Total Requests" yLabel="Department"  />
  </div>
 </div>
          </section>

          {/* Section G: Team (anchor) */}
          <section id="team" ref={sectionRefs.team}>
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
              <p className="text-sm text-gray-500">Home &gt; Team</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-blue-600" size={24} />
                  <span className="text-sm text-gray-600">Total Staff</span>
                </div>
                <div className="text-3xl font-bold">{filteredTeam.length}</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="text-yellow-600" size={24} />
                  <span className="text-sm text-gray-600">Top Performer</span>
                </div>
                <div className="text-lg font-bold">{topPerformer?.admin_name || topPerformer?.name || 'N/A'}</div>
                <div className="text-sm text-gray-500">{topPerformer?.efficiencyScore || '—'}/5.0</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-orange-600" size={24} />
                  <span className="text-sm text-gray-600">Needs Support</span>
                </div>
                <div className="text-3xl font-bold">{needsSupport.length}</div>
                <div className="text-sm text-gray-500" title={(needsSupport.map(a => a.admin_name || a.name).join(', ') || undefined)}>
                  {needsSupport.length > 0 ? `${(needsSupport[0]?.admin_name || needsSupport[0]?.name || '')}${needsSupport.length > 1 ? ' +' + (needsSupport.length - 1) : ''}` : 'admins'}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-600" size={24} />
                  <span className="text-sm text-gray-600">Avg Efficiency</span>
                </div>
                <div className="text-3xl font-bold">{avgTeamEfficiency}</div>
                <div className="text-sm text-gray-500">out of 5.0</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={teamDept}
                  onChange={(e) => setTeamDept(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {teamDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Admin</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tasks Done</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Avg Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Error Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeam.map((admin) => (
                      <tr key={admin.admin_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              {String(admin.admin_name || admin.name || '?').charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold">{admin.admin_name || admin.name || '—'}</div>
                              <div className="text-xs text-gray-500">{admin.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{admin.department_name || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {admin.role || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{admin.tasksCompleted}</td>
                        <td className="py-3 px-4">
                          <span className={admin.avgProcessingTime > 50 ? 'text-red-600' : 'text-green-600'}>
                            {admin.avgProcessingTime} min
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={admin.errorRate > 10 ? 'text-red-600' : 'text-green-600'}>
                            {admin.errorRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">{admin.efficiencyScore}</div>
                            <div className="text-yellow-500">
                              {'★'.repeat(Math.round(admin.efficiencyScore || 0))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Department Workload Distribution - removed per request */}
          </section>

          {/* Section H: Calendar (anchor) */}
          <section id="calendar" ref={sectionRefs.calendar}>
            {(() => {
              // Calendar should respect Department and other filters, but not Date Range.
              const calendarRequests = applyAllFilters(data?.requests || [], user, { ...filters, dateRange: 'All', dateStart: '', dateEnd: '' });
              return <CalendarPage requests={calendarRequests} />;
            })()}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;













