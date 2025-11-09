import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadAllData } from '../utils/dataLoader';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadAllData();
      setData(loaded);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const updateData = (newData) => {
    setData(prev => ({ ...(prev || {}), ...(newData || {}) }));
  };

  return (
    <DataContext.Provider value={{ data, setData: updateData, reload, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
};
