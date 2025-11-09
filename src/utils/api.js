// This file contains helper functions for API-like operations on data
// Since we're using CSV files directly, these functions simulate API behavior

import Papa from 'papaparse';
import { normalizeHeaders } from './dataUtils';

/**
 * Load and parse a CSV file
 * @param {File} file - The CSV file to parse
 * @returns {Promise} - Resolves with parsed data
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const { data, errors, meta } = results;
        if (errors.length > 0) {
          console.warn('CSV Parse Warnings:', errors);
        }
        // Normalize headers to ensure consistent casing and formatting
        const normalizedData = data.map(row => {
          const normalizedRow = {};
          Object.entries(row).forEach(([key, value]) => {
            normalizedRow[normalizeHeaders(key)] = value;
          });
          return normalizedRow;
        });
        resolve(normalizedData);
      },
      error: (error) => reject(error)
    });
  });
};

/**
 * Save data to session storage with timestamp
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const saveToStorage = (key, data) => {
  const storageItem = {
    data,
    timestamp: new Date().toISOString()
  };
  sessionStorage.setItem(key, JSON.stringify(storageItem));
};

/**
 * Load data from session storage with timestamp check
 * @param {string} key - Storage key
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {any} - Stored data or null if expired/missing
 */
export const loadFromStorage = (key, maxAge = 3600000) => {
  const item = sessionStorage.getItem(key);
  if (!item) return null;

  try {
    const { data, timestamp } = JSON.parse(item);
    const age = Date.now() - new Date(timestamp).getTime();
    
    if (age > maxAge) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (e) {
    console.error('Error loading from storage:', e);
    sessionStorage.removeItem(key);
    return null;
  }
};

/**
 * Filter data based on criteria
 * @param {Array} data - Array of data objects
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered data
 */
export const filterData = (data, filters) => {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true; // Skip empty filters
      const itemValue = String(item[key]).toLowerCase();
      return itemValue.includes(String(value).toLowerCase());
    });
  });
};

/**
 * Sort data by field
 * @param {Array} data - Array of data objects
 * @param {string} field - Field to sort by
 * @param {boolean} ascending - Sort direction
 * @returns {Array} - Sorted data
 */
export const sortData = (data, field, ascending = true) => {
  return [...data].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle numeric values
    if (!isNaN(valueA) && !isNaN(valueB)) {
      valueA = Number(valueA);
      valueB = Number(valueB);
    }
    
    // Handle string values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
};

/**
 * Group data by field
 * @param {Array} data - Array of data objects
 * @param {string} field - Field to group by
 * @returns {Object} - Grouped data
 */
export const groupData = (data, field) => {
  return data.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Aggregate data using a reducer function
 * @param {Array} data - Array of data objects
 * @param {string} field - Field to aggregate
 * @param {Function} reducer - Reducer function
 * @param {*} initialValue - Initial value for reducer
 * @returns {*} - Aggregated value
 */
export const aggregateData = (data, field, reducer, initialValue) => {
  return data.reduce((acc, item) => {
    return reducer(acc, item[field]);
  }, initialValue);
};

/**
 * Calculate summary statistics for a numeric field
 * @param {Array} data - Array of data objects
 * @param {string} field - Numeric field to analyze
 * @returns {Object} - Summary statistics
 */
export const calculateStats = (data, field) => {
  const values = data.map(item => Number(item[field])).filter(val => !isNaN(val));
  
  if (values.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      min: 0,
      max: 0
    };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const sorted = [...values].sort((a, b) => a - b);
  
  return {
    count: values.length,
    sum: sum,
    mean: sum / values.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: sorted[Math.floor(sorted.length / 2)]
  };
};