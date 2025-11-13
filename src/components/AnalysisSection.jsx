import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { getSLACompliance, getAvgResolutionMinutes } from '../utils/calculations';

const AnalysisSection = ({ stats, requests }) => {
  const data = Array.isArray(requests) ? requests : [];

  const total = data.length;
  const pending = data.filter((r) => r.status === 'Pending').length;
  const sla = getSLACompliance(data, 60, true);
  const avgRes = getAvgResolutionMinutes(data, true);

  // Average by request type
  const typeMap = {};
  data.forEach((r) => {
    const k = r.request_type || 'Unknown';
    const m = Number(r.processing_time_minutes) || 0;
    if (!typeMap[k]) typeMap[k] = { sum: 0, n: 0 };
    typeMap[k].sum += m;
    typeMap[k].n += 1;
  });
  const typeAverages = Object.entries(typeMap).map(([name, v]) => ({ name, avg: v.n ? v.sum / v.n : 0, n: v.n }));
  const slowestType = typeAverages.sort((a, b) => b.avg - a.avg)[0];

  // Pending by department
  const pendDept = {};
  data
    .filter((r) => r.status === 'Pending')
    .forEach((r) => {
      const k = r.department_name || r.department || 'Unknown';
      pendDept[k] = (pendDept[k] || 0) + 1;
    });
  const topPendDept = Object.entries(pendDept).sort((a, b) => b[1] - a[1])[0];

  // Busy hour (rough)
  const hourCounts = new Array(24).fill(0);
  data.forEach((r) => {
    if (r.created_at) {
      const d = new Date(r.created_at);
      const h = d.getHours();
      if (!isNaN(h)) hourCounts[h]++;
    }
  });
  const busiestHour = hourCounts.reduce((best, val, h) => (val > best.val ? { h, val } : best), { h: 0, val: 0 });

  // Context for department/date window
  const deptSet = new Set(
    data.map((r) => (r.department_name || r.department || '').toString().trim()).filter(Boolean)
  );
  const deptLabel = deptSet.size === 1 ? Array.from(deptSet)[0] : 'All Departments';
  let periodLabel = '';
  const dateVals = data
    .map((r) => (r.created_at ? new Date(r.created_at) : null))
    .filter((d) => d && !isNaN(d));
  if (dateVals.length > 0) {
    const minD = new Date(Math.min(...dateVals));
    const maxD = new Date(Math.max(...dateVals));
    const fmt = (d) => d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    periodLabel = fmt(minD) === fmt(maxD) ? fmt(maxD) : `${fmt(minD)} – ${fmt(maxD)}`;
  }

  // Findings
  const findings = [];
  if (slowestType && slowestType.n >= 5) {
    findings.push({
      type: 'critical',
      icon: AlertTriangle,
      title: 'Slowest Request Type',
      items: [
        `${slowestType.name} averages ${Math.round(slowestType.avg)} minutes (${slowestType.n} requests)`,
        `Overall mean is ${stats?.mean ?? 0} minutes`,
      ],
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
    });
  }
  if (busiestHour.val > 0) {
    findings.push({
      type: 'warning',
      icon: TrendingUp,
      title: 'Peak Workload Window',
      items: [
        `Busiest hour ~ ${busiestHour.h}:00 with ${busiestHour.val} requests`,
        'Consider staffing or batching around this time',
      ],
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
    });
  }
  findings.push({
    type: 'positive',
    icon: CheckCircle,
    title: 'SLA & Throughput',
    items: [`SLA compliance: ${sla}%`, `Avg resolution: ${avgRes} minutes`, `Pending: ${pending} of ${total}`],
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
  });

  // Recommendations (unique to department/date period)
  const recommendations = [];
  if (slowestType && slowestType.avg > (stats?.mean || 0)) {
    recommendations.push({
      priority: 1,
      title: `Streamline ${slowestType.name} in ${deptLabel}`,
      current: `${Math.round(slowestType.avg)} min avg${periodLabel ? ` (${periodLabel})` : ''}`,
      target: `${Math.max(5, Math.round(stats?.mean || 0))} min`,
      savings: 'Time and SLA gains',
      automation: 70,
    });
  }
  if (topPendDept && topPendDept[1] > 0) {
    recommendations.push({
      priority: recommendations.length + 1,
      title: `Clear backlog in ${deptSet.size === 1 ? deptLabel : topPendDept[0]}`,
      current: `${topPendDept[1]} pending${periodLabel ? ` (${periodLabel})` : ''}`,
      target: 'Reduce by 50% this period',
      savings: 'Faster cycle time',
      automation: 50,
    });
  }
  if (busiestHour.val > 0) {
    recommendations.push({
      priority: recommendations.length + 1,
      title: `Peak-hour staffing${deptLabel !== 'All Departments' ? ` for ${deptLabel}` : ''}`,
      current: `${busiestHour.h}:00 has highest load${periodLabel ? ` (${periodLabel})` : ''}`,
      target: 'Match staffing to demand',
      savings: 'Lower queue wait',
      automation: 40,
    });
  }
  const errorRequests = data.filter((r) => (Number(r.error_count) || 0) > 0).length;
  if (total > 0) {
    const errPct = Math.round((errorRequests / total) * 100);
    if (errPct >= 20) {
      recommendations.push({
        priority: recommendations.length + 1,
        title: `Reduce errors in ${deptLabel}`,
        current: `${errPct}% requests with errors${periodLabel ? ` (${periodLabel})` : ''}`,
        target: 'Cut errors by 50% via checks',
        savings: 'Quality and rework reduction',
        automation: 35,
      });
    }
  }
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 1,
      title: `Maintain performance in ${deptLabel}`,
      current: periodLabel ? `Stable metrics (${periodLabel})` : 'Stable metrics',
      target: 'Monitor SLAs and backlogs',
      savings: 'Stable operations',
      automation: 30,
    });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Statistical Analysis & Key Insights</h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Descriptive Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Mean Processing Time</span>
                <span className="text-sm font-semibold text-gray-800">{stats?.mean || 0} minutes</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Median Processing Time</span>
                <span className="text-sm font-semibold text-gray-800">{stats?.median || 0} minutes</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Standard Deviation</span>
                <span className="text-sm font-semibold text-gray-800">{stats?.stdDev || 0} minutes</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Mode (Most Common Task)</span>
                <span className="text-sm font-semibold text-gray-800">{stats?.mode || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Current Signals</h4>
            <div className="space-y-3">
              {findings.map((finding, idx) => {
                const Icon = finding.icon;
                return (
                  <div key={idx} className="py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${finding.iconColor}`} />
                      <span className="text-sm font-medium text-gray-700">{finding.title}</span>
                    </div>
                    {finding.items.map((it, i) => (
                      <p key={i} className="text-xs text-gray-600">
                        {it}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Data-Driven Recommendations</h4>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.priority} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{rec.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Current: <span className="font-medium">{rec.current}</span> · Target:{' '}
                      <span className="font-medium text-green-600">{rec.target}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-600">{rec.savings}</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-blue h-2 rounded-full transition-all duration-500"
                    style={{ width: `${rec.automation}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSection;

