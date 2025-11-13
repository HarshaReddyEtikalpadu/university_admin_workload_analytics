import { WEEKDAYS, WORK_HOURS } from '../../utils/constants';

const HeatmapTable = ({ data }) => {
  const heatmapData = (!data || data.length === 0)
    ? WORK_HOURS.map((hour) => {
        const row = { hour };
        WEEKDAYS.forEach((day) => (row[day] = 0));
        return row;
      })
    : data;

  // Build dynamic thresholds from the current data to ensure varied colors
  const flatValues = [];
  heatmapData.forEach((row) => WEEKDAYS.forEach((d) => flatValues.push(Number(row[d] || 0))));
  const maxVal = flatValues.reduce((m, v) => (v > m ? v : m), 0);
  const q25 = Math.floor((maxVal * 0.25));
  const q50 = Math.floor((maxVal * 0.5));
  const q75 = Math.floor((maxVal * 0.75));

  // Palette similar to your example screenshot
  const COLORS = {
    LOW: '#34D399',      // emerald-400
    MEDIUM: '#FBBF24',   // amber-400
    HIGH: '#FB923C',     // orange-400
    PEAK: '#EF4444',     // red-500
  };

  const getColor = (value) => {
    if (maxVal <= 0) return COLORS.LOW;
    if (value > q75) return COLORS.PEAK;
    if (value > q50) return COLORS.HIGH;
    if (value > q25) return COLORS.MEDIUM;
    return COLORS.LOW;
  };

  const getIntensity = (value) => {
    if (maxVal <= 0) return 'Low';
    if (value > q75) return 'Peak';
    if (value > q50) return 'High';
    if (value > q25) return 'Medium';
    return 'Low';
  };

  let maxValue = 0;
  let peakHours = [];
  heatmapData.forEach((row) => {
    WEEKDAYS.forEach((day) => {
      const value = row[day] || 0;
      if (value > maxValue) {
        maxValue = value;
        peakHours = [{ day, hour: row.hour }];
      } else if (value === maxValue && value > 0) {
        peakHours.push({ day, hour: row.hour });
      }
    });
  });

  const peakText = peakHours.length > 0
    ? `Peak workload: ${peakHours.slice(0, 3).map((p) => `${p.day} ${p.hour}`).join(', ')}`
    : 'No peak workload detected';

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">🔥 Peak Workload Hours (Heatmap)</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Last updated: just now</span>
          
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Hour</th>
              {WEEKDAYS.map((day) => (
                <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100">{row.hour}</td>
                {WEEKDAYS.map((day) => {
                  const value = row[day] || 0;
                  const color = getColor(value);
                  const intensity = getIntensity(value);
                  return (
                    <td
                      key={day}
                      className="px-4 py-3 text-center border-b border-gray-100"
                      style={{ backgroundColor: `${color}20` }}
                      title={`${day} ${row.hour}: ${value} requests (${intensity})`}
                    >
                      <div className="inline-block px-4 py-1 rounded-full text-sm font-semibold text-white shadow" style={{ backgroundColor: color }}>
                        {value}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-700">{peakText}</p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.LOW }}></div>
            <span>Low (≤ {q25})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.MEDIUM }}></div>
            <span>Medium ({q25 + 1}–{q50})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.HIGH }}></div>
            <span>High ({q50 + 1}–{q75})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.PEAK }}></div>
            <span>Peak ({q75 + 1}–{maxVal})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTable;
