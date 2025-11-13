import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChartComponent = ({ data, title = 'Average Processing Time by Type', xKey = 'name', yKey = 'value', unit = 'minutes', showGridlines = true, horizontal = false, yLabel, xLabel, showLegend = true }) => {
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

  // Multiline X ticks for long request type names (no angle)
  const XTickMultiline = ({ x, y, payload }) => {
    const value = String(payload?.value ?? '');
    // simple wrap by words targeting ~12 chars per line
    const words = value.split(' ');
    const lines = [];
    let line = '';
    words.forEach((w) => {
      if ((line + ' ' + w).trim().length > 14) {
        lines.push(line.trim());
        line = w;
      } else {
        line = (line + ' ' + w).trim();
      }
    });
    if (line) lines.push(line);
    // cap to 3 lines to keep height reasonable
    const display = lines.slice(0, 3);
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={10} textAnchor="middle" fill="#374151" fontSize={11}>
          {display.map((t, i) => (
            <tspan key={i} x={0} dy={i === 0 ? 0 : 12}>{t}</tspan>
          ))}
        </text>
        <title>{value}</title>
      </g>
    );
  };

  // Custom X-axis title aligned to left (avoids overlap with bars)
  const XAxisTitle = ({ viewBox, value }) => {
    if (!viewBox) return null;
    const { x, y, width, height } = viewBox;
    const tx = x + 4; // small left padding
    const ty = y + height + 28; // below axis
    return (
      <text x={tx} y={ty} fill="#2563EB" fontSize={12} textAnchor="start">
        {value}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
      {title ? (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      ) : null}
      <div className="w-full">
      <ResponsiveContainer width="100%" height={horizontal ? Math.max(460, (data?.length || 1) * 44) : 420}>
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} barCategoryGap={14} barGap={6} margin={{ top: 20, right: 30, left: horizontal ? 40 : 60, bottom: horizontal ? 80 : 140 }}>
          {showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          {horizontal ? (
            <>
              <XAxis
                type="number"
                domain={[0, 'dataMax + 5']}
                tick={{ fontSize: 12 }}
                label={{ content: <XAxisTitle value={xLabel || "Request Count"} /> }}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                width={110}
                tick={{ fontSize: 12 }}
                label={{ value: yLabel || "Departments", angle: -90, position: "insideLeft", offset: 0, fill: "#2563EB" }}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                interval={0}
                height={120}
                tickMargin={10}
                tick={<XTickMultiline />}
                label={{ value: xLabel || 'Request Type', position: 'insideBottom', offset: -5 }}
              />
              <YAxis label={{ value: yLabel || `${title} (${unit})`, angle: -90, position: 'left' }} tick={{ fontSize: 12 }} />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Bar dataKey={yKey} name={title} fill="#3B82F6" radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]} maxBarSize={120} barSize={horizontal ? 32 : undefined} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;


