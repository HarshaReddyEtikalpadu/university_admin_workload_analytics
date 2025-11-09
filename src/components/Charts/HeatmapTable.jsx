import { WEEKDAYS, WORK_HOURS, HEATMAP_THRESHOLDS } from '../../utils/constants';

const HeatmapTable = ({ data }) => {
  // Ensure we have data, if not, create empty structure
  const heatmapData = (!data || data.length === 0) ? WORK_HOURS.map((hour, index) => {
    const row = { hour };
    WEEKDAYS.forEach(day => {
      row[day] = 0;
    });
    return row;
  }) : data;

  const getColor = (value) => {
    if (value >= HEATMAP_THRESHOLDS.PEAK.min) return HEATMAP_THRESHOLDS.PEAK.color;
    if (value >= HEATMAP_THRESHOLDS.HIGH.min) return HEATMAP_THRESHOLDS.HIGH.color;
    if (value >= HEATMAP_THRESHOLDS.MEDIUM.min) return HEATMAP_THRESHOLDS.MEDIUM.color;
    return HEATMAP_THRESHOLDS.LOW.color;
  };

  const getIntensity = (value) => {
    if (value >= HEATMAP_THRESHOLDS.PEAK.min) return 'Peak';
    if (value >= HEATMAP_THRESHOLDS.HIGH.min) return 'High';
    if (value >= HEATMAP_THRESHOLDS.MEDIUM.min) return 'Medium';
    return 'Low';
  };

  // Find peak hours
  let maxValue = 0;
  let peakHours = [];
  
  if (heatmapData && heatmapData.length > 0) {
    heatmapData.forEach(row => {
      WEEKDAYS.forEach(day => {
        const value = row[day] || 0;
        if (value > maxValue) {
          maxValue = value;
          peakHours = [{ day, hour: row.hour }];
        } else if (value === maxValue && value > 0) {
          peakHours.push({ day, hour: row.hour });
        }
      });
    });
  }

  const peakText = peakHours.length > 0
    ? `💡 Peak workload: ${peakHours.slice(0, 3).map(p => `${p.day} ${p.hour}`).join(', ')}`
    : '💡 No peak workload detected';

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">🔥 Peak Workload Hours</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">Hour</th>
              {WEEKDAYS.map(day => (
                <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b border-gray-200">
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData && heatmapData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100">
                  {row.hour}
                </td>
                {WEEKDAYS.map(day => {
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
                      <div
                        className="inline-block px-3 py-1 rounded-lg text-sm font-semibold text-white"
                        style={{ backgroundColor: color }}
                      >
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
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_THRESHOLDS.LOW.color }}></div>
            <span>Low (0-15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_THRESHOLDS.MEDIUM.color }}></div>
            <span>Medium (16-25)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_THRESHOLDS.HIGH.color }}></div>
            <span>High (26-35)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_THRESHOLDS.PEAK.color }}></div>
            <span>Peak (36+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapTable;
