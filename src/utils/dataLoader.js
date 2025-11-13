import Papa from 'papaparse';
import { generateSampleData } from './sampleData';
import { normalizeHeaders, normalizeRow } from './dataUtils';

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
    
    // Normalize + coerce datasets
    const normalizeDataset = (rows = []) => {
      if (!rows || rows.length === 0) return [];
      const headers = Object.keys(rows[0] || {});
      const nh = normalizeHeaders(headers);
      return rows.map((r) => normalizeRow(r, headers));
    };

    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const toISODate = (v) => {
      if (!v) return '';
      const s = String(v).trim();
      let d = new Date(s);
      if (!isNaN(d)) return d.toISOString();
      // Try DD/MM/YYYY or MM/DD/YYYY
      const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{2}))?/);
      if (m) {
        let a = parseInt(m[1], 10), b = parseInt(m[2], 10), y = parseInt(m[3], 10);
        if (y < 100) y += 2000;
        // If first number > 12, assume DD/MM; otherwise assume MM/DD
        const dd = a > 12 ? a : b;
        const mm = a > 12 ? b : a;
        const hh = m[4] ? parseInt(m[4], 10) : 0;
        const min = m[5] ? parseInt(m[5], 10) : 0;
        d = new Date(y, mm - 1, dd, hh, min, 0);
        if (!isNaN(d)) return d.toISOString();
      }
      return '';
    };

    const normRequests = normalizeDataset(requests || []).map((r) => ({
      ...r,
      processing_time_minutes: toNumber(r.processing_time_minutes),
      error_count: toNumber(r.error_count),
      assigned_admin_id: toNumber(r.assigned_admin_id),
      department_id: toNumber(r.department_id),
      created_at: toISODate(r.created_at),
      resolved_at: toISODate(r.resolved_at),
    }));

    const normAdmins = normalizeDataset(admins || []).map((a) => ({
      ...a,
      admin_id: toNumber(a.admin_id),
      hourly_rate: a.hourly_rate ? Number(a.hourly_rate) : a.hourly_rate,
      department_id: toNumber(a.department_id),
    }));

    const normDepartments = normalizeDataset(departments || []).map((d) => ({
      ...d,
      department_id: toNumber(d.department_id),
    }));

    const normRequestTypes = normalizeDataset(requestTypes || []);
    const normWorklog = normalizeDataset(workloadLog || []);
    const normDaily = normalizeDataset(dailySummary || []);

    // If we got any requests after normalization, use them
    if (normRequests && normRequests.length > 0) {
      return {
        requests: normRequests,
        admins: normAdmins,
        departments: normDepartments,
        requestTypes: normRequestTypes,
        workloadLog: normWorklog,
        dailySummary: normDaily,
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
