import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data, title = 'Average Processing Time by Type', xKey = 'name', yKey = 'value', unit = 'minutes', showGridlines = true, horizontal = false }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-primary-blue">
            <span className="font-medium">{payload[0].value}</span> {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={horizontal ? Math.max(300, (data?.length || 1) * 28) : 300}>
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 20, right: 30, left: 20, bottom: horizontal ? 20 : 60 }}>
          {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey={xKey} width={120} tick={{ fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: `${title} (${unit})`, angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey={yKey} name={title} fill="#3B82F6" radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
