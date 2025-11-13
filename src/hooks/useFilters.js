import { useState, useMemo } from 'react';
import { applyAllFilters } from '../utils/filters';

/**
 * Custom hook to manage filters and filtered data
 */
export const useFilters = (requests, user) => {
  const [filters, setFilters] = useState({
    department: 'All',
    status: 'All',
    priority: 'All',
    type: 'All',
    search: '',
    dateRange: 'This month',
    dateStart: '',
    dateEnd: '',
  });

  const filteredRequests = useMemo(() => {
    if (!requests || !user) return [];
    return applyAllFilters(requests, user, filters);
  }, [requests, user, filters]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      department: 'All',
      status: 'All',
      priority: 'All',
      type: 'All',
      search: '',
      dateRange: 'All',
      dateStart: '',
      dateEnd: '',
    });
  };

  return {
    filters,
    filteredRequests,
    updateFilter,
    resetFilters,
  };
};
