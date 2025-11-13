import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineChartComponent = ({ data, title = 'Workload Trend', xKey = 'month', yKey = 'requests', unit = 'requests', showGridlines = true, yLabel = 'Workload', xLabel = 'Year Wise', showLegend = false }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.stroke }}>
                {entry.name}: <span className="font-medium">{entry.value}</span> {unit}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">{title}</h3>
      <div className="w-full max-w-[900px]">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 12, right: 16, left: 40, bottom: 24 }}>
          {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          <XAxis 
            dataKey={xKey} 
            interval={0}
            tick={{ fontSize: 11 }}
            tickLine={false}
            stroke="#9CA3AF"
            label={{ value: xLabel, position: 'bottom', offset: 12, fill: '#2563EB' }}
          />
          <YAxis 
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: -8, fill: '#2563EB' }}
            tick={{ fontSize: 11 }}
            tickLine={false}
            stroke="#9CA3AF"
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend verticalAlign="top" align="left" wrapperStyle={{ fontSize: 11 }} />}
          <Line 
            type="monotone" 
            dataKey={yKey}
            name={title}
            stroke="#10B981" 
            strokeWidth={2.5}
            dot={{ fill: '#10B981', r: 3 }}
            activeDot={{ r: 5 }}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;
