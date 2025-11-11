import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useData } from '../context/DataContext';
import { useFilters } from '../hooks/useFilters';
import { getSLACompliance, getAvgResolutionMinutes, getMonthlyVolume, getMonthlyCost } from '../utils/calculations';

const round = (n, d = 0) => (Number.isFinite(n) ? Number(n.toFixed(d)) : 0);

const Reports = ({ user }) => {
  const navigate = useNavigate();
  const { data } = useData();
  const { filters, filteredRequests, updateFilter, resetFilters } = useFilters(data?.requests || [], user);

  const handleNavigate = (dest) => {
    if (dest === 'dashboard') return navigate('/dashboard');
    if (dest === 'settings') return navigate('/settings');
    if (dest === 'calendar') return navigate('/calendar');
    if (dest === 'reports') return navigate('/reports');
  };

  const kpis = useMemo(() => {
    // Use settings defaults via conservative choices (60 min SLA, timestamps)
    return {
      sla: getSLACompliance(filteredRequests, 60, true),
      avgResMins: getAvgResolutionMinutes(filteredRequests, true),
      monthlyVolume: getMonthlyVolume(filteredRequests),
      monthlyCost: getMonthlyCost(filteredRequests, data?.admins || [], 25, true),
    };
  }, [filteredRequests, data]);

  // CSV export helpers
  const downloadCSV = (filename, rows) => {
    const escape = (v) => {
      const s = (v ?? '').toString().replace(/"/g, '""');
      const needsQuotes = s.includes('"') || s.includes(',') || s.includes('\n');
      return needsQuotes ? `"${s}"` : s;
    };
    const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMonthlyOpsCSV = () => {
    const rows = [["Section", "Metric", "Value"]];
    rows.push(["KPIs", "Total Requests", filteredRequests.length]);
    const resolved = filteredRequests.filter((r) => ['Approved', 'Resolved'].includes(r.status));
    rows.push(["KPIs", "Resolved", resolved.length]);
    rows.push(["KPIs", "SLA %", `${kpis.sla}%`]);
    rows.push([]);
    rows.push(["By Type", "Type", "Count"]);
    const byType = {};
    filteredRequests.forEach((r) => {
      byType[r.request_type] = (byType[r.request_type] || 0) + 1;
    });
    Object.entries(byType).forEach(([t, c]) => rows.push(["By Type", t, c]));
    rows.push([]);
    rows.push(["By Dept", "Department", "Count"]);
    const byDept = {};
    filteredRequests.forEach((r) => {
      byDept[r.department_name] = (byDept[r.department_name] || 0) + 1;
    });
    Object.entries(byDept).forEach(([d, c]) => rows.push(["By Dept", d, c]));
    downloadCSV('monthly_operations_summary.csv', rows);
  };

  const exportDeptPerfCSV = () => {
    const header = ["Department", "Total", "Errors", "Avg Time (min)"];
    const by = {};
    filteredRequests.forEach((r) => {
      const k = r.department_name || 'Unknown';
      if (!by[k]) by[k] = { total: 0, errors: 0, time: 0 };
      by[k].total += 1;
      by[k].errors += Number(r.error_count) || 0;
      by[k].time += Number(r.processing_time_minutes) || 0;
    });
    const rows = [header];
    Object.entries(by).forEach(([d, v]) => rows.push([d, v.total, v.errors, v.total ? round(v.time / v.total, 2) : 0]));
    downloadCSV('department_performance.csv', rows);
  };

  const exportAdminProdCSV = () => {
    const header = ["Admin", "Total", "Avg Time (min)", "Approvals", "Rejections", "Pending"];
    const by = {};
    filteredRequests.forEach((r) => {
      const k = r.assigned_admin_name || `Admin ${r.assigned_admin_id || ''}`;
      if (!by[k]) by[k] = { total: 0, time: 0, approvals: 0, rejections: 0, pending: 0 };
      by[k].total += 1;
      by[k].time += Number(r.processing_time_minutes) || 0;
      if (r.status === 'Approved' || r.status === 'Resolved') by[k].approvals += 1;
      else if (r.status === 'Rejected') by[k].rejections += 1;
      else by[k].pending += 1;
    });
    const rows = [header];
    Object.entries(by).forEach(([name, v]) => rows.push([name, v.total, v.total ? round(v.time / v.total, 2) : 0, v.approvals, v.rejections, v.pending]));
    downloadCSV('admin_productivity.csv', rows);
  };

  const TemplateCard = ({ title, desc, onCSV }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <h4 className="text-base font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
      <div className="flex items-center gap-2 mt-3">
        <button className="px-3 py-1.5 rounded-md bg-gray-900 text-white" onClick={() => window.print()}>Export PDF</button>
        <button className="px-3 py-1.5 rounded-md bg-gray-100" onClick={onCSV}>Export CSV</button>
        <button className="px-3 py-1.5 rounded-md bg-gray-100" onClick={() => alert('PPT export not implemented')}>Export PPT</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onSearch={(q) => updateFilter('search', q)} onNavigate={handleNavigate} onLogout={() => navigate('/login')} />
      <Sidebar user={user} filters={filters} onFilterChange={updateFilter} onResetFilters={resetFilters} onNavigate={handleNavigate} activeSection={'reports'} />

      <main className="ml-64 mt-20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-500">Home &gt; Reports</p>
            </div>
          </section>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="text-sm text-gray-500 mb-1">SLA Compliance</div>
                <div className="text-4xl font-bold text-gray-900">{kpis.sla}%</div>
                {/* trend placeholder intentionally removed */}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="text-sm text-gray-500 mb-1">Avg Resolution</div>
                <div className="text-4xl font-bold text-gray-900">{kpis.avgResMins} min</div>
                {/* trend placeholder intentionally removed */}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <div className="text-sm text-gray-500 mb-1">Monthly Volume</div>
                <div className="text-4xl font-bold text-gray-900">{kpis.monthlyVolume.toLocaleString()}</div>
                {/* trend placeholder intentionally removed */}
              </div>
            </div>
          </section>

          <section>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-800">Report Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <TemplateCard
                  title="Monthly Operations Summary"
                  desc="KPIs, requests by type/department, backlog & SLA."
                  onCSV={exportMonthlyOpsCSV}
                />
                <TemplateCard
                  title="Department Performance"
                  desc="Per-dept throughput, errors, staffing recommendations."
                  onCSV={exportDeptPerfCSV}
                />
                <TemplateCard
                  title="Admin Productivity"
                  desc="Per-admin workload, avg time, approvals & anomalies."
                  onCSV={exportAdminProdCSV}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Reports;
