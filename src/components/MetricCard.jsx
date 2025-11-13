const MetricCard = ({ icon: Icon, label, value, trend, trendValue, trendLabel, iconColor = 'bg-blue-500' }) => {
  const isNegativeWhenUp = () => {
    const badWords = ['error', 'rejection', 'cost', 'avg processing time'];
    const lower = (label || '').toLowerCase();
    return badWords.some((w) => lower.includes(w));
  };

  // Unicode arrows: up, down, neutral (right)
  const trendSymbol = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192';

  const trendColor = (() => {
    if (!trend || trend === 'neutral') return 'text-gray-500';
    const upIsBad = isNegativeWhenUp();
    if (trend === 'up') return upIsBad ? 'text-red-600' : 'text-green-600';
    return upIsBad ? 'text-green-600' : 'text-red-600';
  })();

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow duration-200 border border-gray-50">
      <div className="flex items-start gap-4">
        <div className={`${iconColor} rounded-lg p-3 flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{label}</p>
            {typeof trendValue !== 'undefined' && (
              <div className={`text-xs font-semibold ${trendColor} flex items-center gap-1`}>
                <span aria-hidden="true">{trendSymbol}</span>
                <span>{trendValue}%</span>
              </div>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
          {trendLabel && <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;

