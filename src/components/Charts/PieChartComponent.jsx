import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const PieChartComponent = ({ 
  data, 
  title = 'Distribution', 
  unit = 'requests',
  innerRadius = 0,
  outerRadius = 100,
  showPercent = true
}) => {
  const COLORS = CHART_COLORS.slice(0, data?.length || 5);

  const total = data?.reduce((sum, item) => sum + item.value, 0) || 1;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{payload[0].value}</span> {unit}
          </p>
          <p className="text-xs text-gray-500">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  const dataWithPercent = data?.map(item => ({
    ...item,
    percent: ((item.value / total) * 100).toFixed(1),
  })) || [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dataWithPercent}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showPercent ? ({ percent }) => `${percent}%` : undefined}
            innerRadius={innerRadius}
            outerRadius={Math.min(outerRadius, 90)}
            fill="#8884d8"
            dataKey="value"
          >
            {dataWithPercent.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom legend below the chart to avoid overlap */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {dataWithPercent.map((item, idx) => (
          <div key={`${item.name}-${idx}`} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="inline-block w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
            <span className="truncate" title={item.name}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartComponent;
