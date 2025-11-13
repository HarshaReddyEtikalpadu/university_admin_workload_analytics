import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, AlertTriangle, Award, Search } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useData } from '../context/DataContext';
import { useFilters } from '../hooks/useFilters';
import BarChartComponent from '../components/Charts/BarChartComponent';

const TeamPage = ({ user }) => {
  const navigate = useNavigate();
  const { data } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  const handleNavigate = (dest) => {
    if (dest === 'dashboard') return navigate('/dashboard');
    if (dest === 'settings') return navigate('/settings');
    if (dest === 'calendar') return navigate('/calendar');
    if (dest === 'reports') return navigate('/reports');
    if (dest === 'team') return navigate('/team');
  };

  // Build team stats from admins + requests
  const teamStats = useMemo(() => {
    const admins = data?.admins || [];
    const requests = data?.requests || [];

    return admins.map((admin) => {
      const adminId = Number(admin.admin_id) || admin.admin_id;
      const adminTasks = requests.filter((r) => Number(r.assigned_admin_id) === adminId);
      const completedTasks = adminTasks.filter((r) => r.status !== 'Pending').length;

      const totalTime = adminTasks.reduce((sum, r) => sum + (Number(r.processing_time_minutes) || 0), 0);
      const avgTime = adminTasks.length > 0 ? Math.round(totalTime / adminTasks.length) : 0;

      const errorTasks = adminTasks.filter((r) => (Number(r.error_count) || 0) > 0).length;
      const errorRate = adminTasks.length > 0 ? ((errorTasks / adminTasks.length) * 100).toFixed(1) : '0.0';

      const eff = Number(admin.efficiency_score) || 4.0;

      return {
        ...admin,
        tasksCompleted: completedTasks,
        avgProcessingTime: avgTime,
        errorRate,
        efficiencyScore: eff,
      };
    });
  }, [data]);

  // Filtered team view
  const filteredTeam = useMemo(() => {
    const list = teamStats || [];
    return list.filter((admin) => {
      const matchesSearch = (admin.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === 'All' || (admin.department_name || '') === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [teamStats, searchTerm, filterDept]);

  // Departments for filter
  const departments = useMemo(() => {
    const set = new Set((teamStats || []).map((a) => a.department_name).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [teamStats]);

  // Overview metrics
  const topPerformer = useMemo(() => {
    return (teamStats || []).reduce(
      (best, a) => (a.efficiencyScore > (best?.efficiencyScore || 0) ? a : best),
      null
    );
  }, [teamStats]);

  const needsSupport = useMemo(() => {
    return (teamStats || []).filter((a) => (Number(a.efficiencyScore) || 0) < 4.0).length;
  }, [teamStats]);

  const avgEfficiency = useMemo(() => {
    const arr = (teamStats || []).map((a) => Number(a.efficiencyScore) || 0);
    if (arr.length === 0) return '0.0';
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    return avg.toFixed(1);
  }, [teamStats]);

  // Department workload distribution from requests
  const deptWorkload = useMemo(() => {
    const requests = data?.requests || [];
    const by = new Map();
    requests.forEach((r) => {
      const k = r.department_name || r.department || 'Unknown';
      by.set(k, (by.get(k) || 0) + 1);
    });
    return Array.from(by.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Insights
  const insights = useMemo(() => {
    const list = [];
    if (topPerformer) list.push({ type: 'good', text: `Top Performer: ${topPerformer.name} (${topPerformer.efficiencyScore}/5.0 efficiency)` });
    if ((teamStats || []).length > 0 && needsSupport > 0) list.push({ type: 'warn', text: `Needs Training: ${needsSupport} admin(s) below 4.0 score` });
    const first = deptWorkload[0];
    const last = deptWorkload[deptWorkload.length - 1];
    if (first && last && first.value >= 2 * last.value && last.value > 0) {
      list.push({ type: 'alert', text: `Workload Imbalance: ${first.name} has ~${(first.value / last.value).toFixed(1)}x more work than ${last.name}` });
    }
    return list;
  }, [topPerformer, needsSupport, deptWorkload, teamStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={() => navigate('/login')} onSearch={(q) => setSearchTerm(q)} onNavigate={handleNavigate} />
      <Sidebar user={user} filters={{}} onFilterChange={() => {}} onResetFilters={() => {}} onNavigate={handleNavigate} activeSection={"team"} />

      <main className="ml-64 mt-20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
            <p className="text-sm text-gray-500">Home &gt; Team</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-blue-600" size={24} />
                <span className="text-sm text-gray-600">Total Staff</span>
              </div>
              <div className="text-3xl font-bold">{teamStats.length}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Award className="text-yellow-600" size={24} />
                <span className="text-sm text-gray-600">Top Performer</span>
              </div>
              <div className="text-lg font-bold">{topPerformer?.name || 'N/A'}</div>
              <div className="text-sm text-gray-500">{topPerformer ? `${topPerformer.efficiencyScore}/5.0` : ''}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="text-orange-600" size={24} />
                <span className="text-sm text-gray-600">Needs Support</span>
              </div>
              <div className="text-3xl font-bold">{needsSupport}</div>
              <div className="text-sm text-gray-500">admins</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-600" size={24} />
                <span className="text-sm text-gray-600">Avg Efficiency</span>
              </div>
              <div className="text-3xl font-bold">{avgEfficiency}</div>
              <div className="text-sm text-gray-500">out of 5.0</div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                            {(admin.name || '').charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold">{admin.name}</div>
                            <div className="text-xs text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{admin.department_name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{admin.role}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold">{admin.tasksCompleted}</td>
                      <td className="py-3 px-4">
                        <span className={Number(admin.avgProcessingTime) > 50 ? 'text-red-600' : 'text-green-600'}>
                          {admin.avgProcessingTime} min
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={Number(admin.errorRate) > 10 ? 'text-red-600' : 'text-green-600'}>
                          {admin.errorRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold">{admin.efficiencyScore}</div>
                          <div className="text-yellow-500">{'⭐'.repeat(Math.round(Number(admin.efficiencyScore) || 0))}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Workload Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Department Workload Distribution</h3>
            <BarChartComponent
              data={deptWorkload}
              title=""
              horizontal
              xKey="name"
              yKey="value"
              xLabel="Department"
              yLabel="Requests"
              showLegend={false}
              showGridlines
            />
          </div>

          {/* Team Insights & Alerts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Team Insights & Alerts</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {insights.map((i, idx) => (
                <li key={idx}>• {i.text}</li>
              ))}
              {insights.length === 0 && <li>No notable insights detected.</li>}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamPage;

