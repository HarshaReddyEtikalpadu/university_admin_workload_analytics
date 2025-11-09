import Papa from 'papaparse';
import { generateSampleData } from './sampleData';

/**
 * Load CSV file and parse it
 */
export const loadCSV = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}`);
    }
    
    const text = await response.text();
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  } catch (error) {
    console.warn(`Could not load CSV file ${filePath}, using sample data instead:`, error);
    return null;
  }
};

/**
 * Load all data files (CSV or generate sample data)
 */
export const loadAllData = async () => {
  try {
    // If an override dataset is present in sessionStorage (uploaded via UI), use it
    const override = sessionStorage.getItem('dashboardOverride');
    if (override) {
      try {
        const parsed = JSON.parse(override);
        console.log('Using override data from sessionStorage');
        return parsed;
      } catch (e) {
        console.warn('Failed to parse dashboardOverride:', e);
        // fall through to normal loading
      }
    }
  } catch (e) {
    // ignore sessionStorage errors
  }
  try {
    // Try to load CSV files
    const [requests, admins, departments, requestTypes, workloadLog, dailySummary] = await Promise.all([
      loadCSV('/data/requests.csv'),
      loadCSV('/data/admins.csv'),
      loadCSV('/data/departments.csv'),
      loadCSV('/data/request_types.csv'),
      loadCSV('/data/workload_log.csv'),
      loadCSV('/data/daily_summary.csv'),
    ]);
    
    // If requests data loaded successfully, use it
    if (requests && requests.length > 0) {
      return {
        requests,
        admins: admins || [],
        departments: departments || [],
        requestTypes: requestTypes || [],
        workloadLog: workloadLog || [],
        dailySummary: dailySummary || [],
        source: 'csv',
      };
    }
    
    // Otherwise, generate sample data
    console.log('Generating sample data...');
    const sample = generateSampleData();
    return { ...sample, source: 'sample' };
  } catch (error) {
    console.error('Error loading data:', error);
    // Fallback to sample data
    console.log('Falling back to sample data...');
    const sample = generateSampleData();
    return { ...sample, source: 'sample' };
  }
};

/**
 * Set override data for the dashboard in sessionStorage (used by upload UI)
 */
export const setOverrideData = (data) => {
  try {
    const obj = { ...(data || {}), source: data?.source || 'uploaded' };
    sessionStorage.setItem('dashboardOverride', JSON.stringify(obj));
    return true;
  } catch (e) {
    console.error('Failed to set override data:', e);
    return false;
  }
};
