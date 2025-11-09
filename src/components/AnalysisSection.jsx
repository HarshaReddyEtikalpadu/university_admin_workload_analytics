import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';

const AnalysisSection = ({ stats, requests }) => {
  // Calculate correlations (simulated data for demo)
  const correlations = [
    {
      name: 'Admin Experience ↔ Speed',
      value: -0.67,
      insight: 'Experienced admins are 35% faster',
    },
    {
      name: 'Task Complexity ↔ Errors',
      value: +0.82,
      insight: 'Complex tasks have 3x errors',
    },
    {
      name: 'Time of Day ↔ Efficiency',
      value: -0.54,
      insight: 'Afternoon is 18% slower',
    },
  ];

  const findings = [
    {
      type: 'critical',
      icon: AlertTriangle,
      title: 'Critical Issues',
      items: [
        'Document Verification tasks take 68 minutes on average (target: 15 min)',
        'Peak workload hours (9-11 AM) show 40% slower processing',
        'Error rate is 12% higher for complex tasks',
      ],
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
    },
    {
      type: 'warning',
      icon: TrendingUp,
      title: 'Concerning Trends',
      items: [
        'Pending requests increased by 15% this month',
        'Average processing time increased by 8 minutes',
        'Weekend requests have lower approval rates',
      ],
      color: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
    },
    {
      type: 'positive',
      icon: CheckCircle,
      title: 'Positive Observations',
      items: [
        'Overall approval rate improved to 78%',
        'Automated workflows reduced manual steps by 25%',
        'Team efficiency score increased by 12%',
      ],
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
    },
  ];

  // Generate recommendations
  const recommendations = [
    {
      priority: 1,
      title: 'Automate Document Verification',
      current: '68 min avg',
      target: '15 min',
      savings: '$6,200/month',
      automation: 80,
    },
    {
      priority: 2,
      title: 'Implement Peak Hour Staffing',
      current: '40% slower',
      target: '10% slower',
      savings: '$3,500/month',
      automation: 60,
    },
    {
      priority: 3,
      title: 'Streamline Complex Task Workflow',
      current: '3x errors',
      target: '1.5x errors',
      savings: '$2,100/month',
      automation: 45,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistical Analysis */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">🔬 Statistical Analysis & Key Insights</h3>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Descriptive Statistics */}
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

          {/* Correlation Analysis */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Correlation Analysis</h4>
            <div className="space-y-3">
              {correlations.map((corr, index) => (
                <div key={index} className="py-2 border-b border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">{corr.name}</span>
                    <span className={`text-sm font-semibold ${corr.value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {corr.value > 0 ? '+' : ''}{corr.value.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{corr.insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {findings.map((finding, index) => {
            const Icon = finding.icon;
            return (
              <div key={index} className={`${finding.color} border-2 rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-5 h-5 ${finding.iconColor}`} />
                  <h5 className="font-semibold text-gray-800">{finding.title}</h5>
                </div>
                <ul className="space-y-2">
                  {finding.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">🎯 Data-Driven Recommendations</h3>
        
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.priority} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {rec.priority}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Current: <span className="font-medium">{rec.current}</span> → Target: <span className="font-medium text-green-600">{rec.target}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">Savings: {rec.savings}</p>
                </div>
              </div>
              
              <div className="ml-11">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Automation Potential</span>
                  <span className="text-xs font-semibold text-gray-700">{rec.automation}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-blue h-2 rounded-full transition-all duration-500"
                    style={{ width: `${rec.automation}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalysisSection;
