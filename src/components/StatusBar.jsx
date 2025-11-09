import { useEffect, useState } from 'react';

const StatusBar = () => {
  const [dataStatus, setDataStatus] = useState('Loading...');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  useEffect(() => {
    // Mock update - replace with real data source status check
    setTimeout(() => {
      setDataStatus('CSV files loaded');
      setLastUpdated(new Date());
    }, 1500);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center text-gray-600">
        <div className="flex items-center gap-4">
          <div>
            <span className="font-medium">Data Source:</span> {dataStatus}
          </div>
          {lastUpdated && (
            <div>
              <span className="font-medium">Last Updated:</span>{' '}
              {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div>
          <span className="font-medium">Status:</span>{' '}
          <span className="text-green-600" aria-hidden="true">●</span> Online
        </div>
      </div>
    </div>
  );
};

export default StatusBar;

