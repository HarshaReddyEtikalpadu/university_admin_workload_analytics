import React, { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MetricCard from '../components/MetricCard';
import PieChartComponent from '../components/Charts/PieChartComponent';
import BarChartComponent from '../components/Charts/BarChartComponent';
import LineChartComponent from '../components/Charts/LineChartComponent';
import HeatmapTable from '../components/Charts/HeatmapTable';
import DataSourcePanel from '../components/DataSourcePanel';
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

const Dashboard = ({ user, data, onLogout }) => {
  const { filters, filteredRequests, updateFilter, resetFilters } = useFilters(data?.requests || [], user);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');

  const sectionRefs = {
    dashboard: useRef(null),
    analytics: useRef(null),
    tasks: useRef(null),
    reports: useRef(null),
    team: useRef(null),
    calendar: useRef(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
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
    const scrollKeys = ['dashboard', 'analytics', 'tasks', 'reports', 'team', 'calendar'];
    if (scrollKeys.includes(dest)) {
      const el = sectionRefs[dest]?.current;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate all metrics
  const kpis = useMemo(() => {
    return calculateKPIs(filteredRequests);
  }, [filteredRequests]);

  const chartData = useMemo(() => {
    return {
      pieData: getRequestTypeData(filteredRequests),
      barData: getAvgTimeByType(filteredRequests),
      trendData: getTrendData(filteredRequests),
      heatmapData: getHeatmapData(filteredRequests),
    };
  }, [filteredRequests]);

  const stats = useMemo(() => {
    return getDescriptiveStats(filteredRequests);
  }, [filteredRequests]);

  // Reports KPIs and charts
  const reportKpis = useMemo(() => {
    return {
      sla: getSLACompliance(filteredRequests, 60, true),
      avgResMins: getAvgResolutionMinutes(filteredRequests, true),
      monthlyVolume: getMonthlyVolume(filteredRequests),
      monthlyCost: getMonthlyCost(filteredRequests, data?.admins || [], 25, true),
    };
  }, [filteredRequests, data]);

  const reportsStatusPie = useMemo(() => {
    const by = { Approved: 0, Rejected: 0, Pending: 0, Resolved: 0 };
    filteredRequests.forEach(r => { by[r.status] = (by[r.status] || 0) + 1; });
    return Object.entries(by).map(([name, value]) => ({ name, value }));
  }, [filteredRequests]);

  const [deptScope, setDeptScope] = useState(() => settings.deptChartScope || 'all');
  const reportsDeptBar = useMemo(() => {
    const source = deptScope === 'filtered' ? (filteredRequests || []) : (data?.requests || []);
    const by = {};
    source.forEach((r) => {
      const k = r.department_name || 'Unknown';
      by[k] = (by[k] || 0) + 1;
    });
    return Object.entries(by)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [deptScope, filteredRequests, data]);

  const handleSearch = (query) => {
    updateFilter('search', query);
  };

  const handleExport = (dataToExport) => {
    console.log('Exporting data:', dataToExport);
    // In a real application, this would download a CSV file
    alert(`Exporting ${dataToExport.length} requests to CSV...`);
  };

  // Calculate trend indicators (simplified - in real app, compare with previous period)
  const getTrend = (current, previous = current * 0.9) => {
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      value: Math.abs(change).toFixed(1),
    };
  };

  const metricCards = [
    {
      icon: FileText,
      label: 'Total Requests',
      value: kpis.totalRequests.toLocaleString(),
      trend: getTrend(kpis.totalRequests),
      trendLabel: 'vs last month',
      iconColor: 'bg-blue-500',
    },
    {
      icon: Clock,
      label: 'Total Hours Spent',
      value: kpis.totalHours.toLocaleString(),
      trend: getTrend(kpis.totalHours),
      trendLabel: 'vs last month',
      iconColor: 'bg-purple-500',
    },
    {
      icon: DollarSign,
      label: 'Total Cost',
      value: `$${kpis.totalCost.toLocaleString()}`,
      trend: getTrend(kpis.totalCost),
      trendLabel: 'vs last month',
      iconColor: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Avg Processing Time',
      value: `${kpis.avgProcessingTime} min`,
      trend: getTrend(kpis.avgProcessingTime, kpis.avgProcessingTime * 1.1),
      trendLabel: 'vs last month',
      iconColor: 'bg-orange-500',
    },
    {
      icon: CheckCircle,
      label: 'Approval Rate',
      value: `${kpis.approvalRate}%`,
      trend: getTrend(kpis.approvalRate, kpis.approvalRate * 0.95),
      trendLabel: 'vs last month',
      iconColor: 'bg-green-500',
    },
    {
      icon: XCircle,
      label: 'Rejection Rate',
      value: `${kpis.rejectionRate}%`,
      trend: getTrend(kpis.rejectionRate, kpis.rejectionRate * 0.9),
      trendLabel: 'vs last month',
      iconColor: 'bg-red-500',
    },
    {
      icon: AlertCircle,
      label: 'Pending Requests',
      value: kpis.pendingRequests.toLocaleString(),
      trend: getTrend(kpis.pendingRequests),
      trendLabel: 'vs last month',
      iconColor: 'bg-yellow-500',
    },
    {
      icon: AlertTriangle,
      label: 'Error Rate',
      value: `${kpis.errorRate}%`,
      trend: getTrend(kpis.errorRate, kpis.errorRate * 0.9),
      trendLabel: 'vs last month',
      iconColor: 'bg-red-500',
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} onSearch={handleSearch} onNavigate={handleNavigate} />
      <Sidebar user={user} filters={filters} onFilterChange={updateFilter} onResetFilters={resetFilters} onNavigate={handleNavigate} activeSection={activeSection} />
      
      <main className="ml-64 mt-20 p-4 md:p-6">
        {/* Small verification / status bar */}
        <div className="max-w-7xl mx-auto mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">Data source: <span className="font-medium">{data.source || 'unknown'}</span></div>
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">Visible requests: <span className="font-medium">{filteredRequests.length}</span></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">Showing data filtered for <span className="font-semibold">{user?.name}</span></div>
              {/* Data upload / diagnostics panel */}
              <div>
                <Suspense fallback={<div className="text-xs text-gray-500">Loading...</div>}>
                  <DataSourcePanel currentSource={data.source} />
                </Suspense>
              </div>
            </div>
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
                showGridlines={settings.gridlines}
              />
              <LineChartComponent 
                data={chartData.trendData} 
                title="Workload Trend (6 Months)"
                xKey="month"
                yKey="requests"
                showGridlines={settings.gridlines}
              />
            </div>
          </section>

          {/* Section C: Heatmap Table */}
          <section>
            <HeatmapTable data={chartData.heatmapData} />
          </section>

          {/* Section D: Statistical Analysis */}
          <section>
            <AnalysisSection stats={stats} requests={filteredRequests} />
          </section>

          {/* Section E: Tasks Overview + Data Table */}
          <section id="tasks" ref={sectionRefs.tasks}>
            <MyTasksOverview
              requests={filteredRequests}
              user={user}
              onRefresh={() => window.location.reload()}
              onClearFilters={resetFilters}
            />
            <div className="h-4" />
            <DataTable data={filteredRequests} onExport={handleExport} />
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
                  <div className="text-sm">
                    <label className="mr-2">Scope:</label>
                    <select value={deptScope} onChange={(e) => setDeptScope(e.target.value)} className="border rounded px-2 py-1">
                      <option value="all">All</option>
                      <option value="filtered">Filtered</option>
                    </select>
                  </div>
                </div>
                <BarChartComponent data={reportsDeptBar} title="Requests by Department" xKey="name" yKey="value" showGridlines={settings.gridlines} horizontal />
              </div>
            </div>
          </section>

          {/* Section G: Team (anchor) */}
          <section id="team" ref={sectionRefs.team}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-2xl font-bold text-gray-900">Team</h2>
              <p className="text-sm text-gray-500">Home > Team</p>
              <p className="text-sm text-gray-600 mt-2">Team overview placeholder.</p>
            </div>
          </section>

          {/* Section H: Calendar (anchor) */}
          <section id="calendar" ref={sectionRefs.calendar}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
              <p className="text-sm text-gray-500">Home > Calendar</p>
              <p className="text-sm text-gray-600 mt-2">Calendar placeholder.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
