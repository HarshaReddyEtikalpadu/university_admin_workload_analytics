import Papa from 'papaparse';
import { useState } from 'react';
import { useData } from '../context/DataContext';

const expectedFiles = {
  'requests.csv': 'requests',
  'admins.csv': 'admins',
  'departments.csv': 'departments',
  'request_types.csv': 'requestTypes',
  'workload_log.csv': 'workloadLog',
  'daily_summary.csv': 'dailySummary',
};

const DataSourcePanel = ({ currentSource }) => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const { setData, reload } = useData();

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage('Parsing files...');

    const promises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              resolve({ name: file.name, data: results.data || [] });
            },
            error: () => {
              resolve({ name: file.name, data: null, error: true });
            },
          });
        };
        reader.onerror = () => resolve({ name: file.name, data: null, error: true });
        reader.readAsText(file);
      });
    });

    Promise.all(promises).then(parsedFiles => {
      const dataObj = {};
      let totalRequests = 0;
      parsedFiles.forEach(f => {
        const key = expectedFiles[f.name];
        if (key && f.data) {
          dataObj[key] = f.data;
          if (key === 'requests') totalRequests = f.data.length;
        }
      });

      dataObj.source = 'uploaded';

      // Persist override in sessionStorage for future loads
      try {
        sessionStorage.setItem('dashboardOverride', JSON.stringify(dataObj));
      } catch (e) {
        console.warn('Failed to persist override:', e);
      }

      // Apply in-memory
      setData(dataObj);
      setMessage(`Loaded ${totalRequests} requests from uploaded files.`);
      setUploading(false);
    }).catch(err => {
      console.error(err);
      setMessage('Failed to parse uploaded files');
      setUploading(false);
    });
  };

  const onChange = (e) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const clearOverride = () => {
    sessionStorage.removeItem('dashboardOverride');
    setMessage('Cleared uploaded override. Reloading data...');
    // reload from DataProvider
    setTimeout(() => reload(), 400);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-gray-500">Data:</label>
      <div className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">{currentSource || 'unknown'}</div>

      <label className="text-xs text-gray-500">Upload CSV(s)</label>
      <input type="file" accept=".csv" multiple onChange={onChange} className="text-sm" />

      <button
        onClick={clearOverride}
        className="ml-2 text-xs text-red-600 hover:underline"
      >
        Clear Uploaded Data
      </button>

      {uploading && <div className="text-xs text-gray-500 ml-2">{message}</div>}
      {!uploading && message && <div className="text-xs text-gray-500 ml-2">{message}</div>}
    </div>
  );
};

export default DataSourcePanel;
