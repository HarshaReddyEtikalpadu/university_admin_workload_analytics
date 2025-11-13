/**
 * Filter requests based on user role
 */
export const filterByRole = (requests, user) => {
  if (!requests) return [];
  // Super admin view: no role-based scoping. Always return all requests.
  return requests;
};

/**
 * Filter requests by department
 */
export const filterByDepartment = (requests, department) => {
  if (!requests) return [];
  if (!department || department === 'All') return requests;
  const target = String(department).trim().toLowerCase();

  return requests.filter((req) => {
    const name = String(req.department_name ?? req.department ?? '')
      .trim()
      .toLowerCase();
    return name === target;
  });
};

/**
 * Filter requests by status
 */
export const filterByStatus = (requests, status) => {
  if (!requests) return [];
  if (!status || status === 'All') return requests;
  const target = String(status).trim().toLowerCase();

  return requests.filter((req) => {
    const value = String(req.status ?? req.Status ?? '')
      .trim()
      .toLowerCase();
    return value === target;
  });
};

/**
 * Filter requests by priority
 */
export const filterByPriority = (requests, priority) => {
  if (!requests) return [];
  if (!priority || priority === 'All') return requests;
  const target = String(priority).trim().toLowerCase();

  return requests.filter((req) => {
    const value = String(req.priority ?? req.Priority ?? '')
      .trim()
      .toLowerCase();
    return value === target;
  });
};

/**
 * Filter requests by type
 */
export const filterByType = (requests, type) => {
  if (!requests) return [];
  if (!type || type === 'All') return requests;
  const target = String(type).trim().toLowerCase();

  return requests.filter((req) => {
    const value = String(
      req.request_type ?? req.type ?? req.requestType ?? ''
    )
      .trim()
      .toLowerCase();
    return value === target;
  });
};

/**
 * Search requests by query string
 */
export const searchRequests = (requests, query, scope = 'All') => {
  if (!requests) return [];
  if (!query || query.trim() === '') return requests;
  
  const searchTerm = query.toLowerCase().trim();
  
  return requests.filter(req => {
    const fields = {
      Requests: [
        String(req.request_id || ''),
        String(req.request_number || ''),
        String(req.request_type || ''),
        String(req.status || ''),
      ],
      Departments: [
        String(req.department_name || req.department || ''),
      ],
      Admins: [
        String(req.assigned_admin_name || ''),
      ],
      All: [],
    };
    // All = union of all categories
    if (scope === 'All' || !fields[scope]) {
      fields.All = [
        String(req.request_id || ''),
        String(req.request_number || ''),
        String(req.request_type || ''),
        String(req.status || ''),
        String(req.department_name || req.department || ''),
        String(req.assigned_admin_name || ''),
      ];
    }
    const bucket = (scope === 'All' || !fields[scope]) ? fields.All : fields[scope];
    return bucket.some((v) => v.toLowerCase().includes(searchTerm));
  });
};

/**
 * Apply all filters to requests
 */
export const applyAllFilters = (requests, user, filters = {}) => {
  if (!requests) return [];

  let filtered = [...requests];

  // Super admin view: role filter returns all items
  filtered = filterByRole(filtered, user);

  // Apply other filters
  if (filters.department) {
    filtered = filterByDepartment(filtered, filters.department);
  }

  if (filters.status) {
    filtered = filterByStatus(filtered, filters.status);
  }

  if (filters.priority) {
    filtered = filterByPriority(filtered, filters.priority);
  }

  if (filters.type) {
    filtered = filterByType(filtered, filters.type);
  }

  // Date range filtering by created_at
  if (filters.dateRange || (filters.dateStart && filters.dateEnd)) {
    filtered = filterByDateRange(filtered, filters);
  }

  if (filters.search) {
    filtered = searchRequests(filtered, filters.search, filters.searchScope || 'All');
  }

  return filtered;
};

/**
 * Filter by date range (created_at)
 * Supports presets via filters.dateRange and custom via filters.dateStart/dateEnd (YYYY-MM-DD)
 */
export const filterByDateRange = (requests, { dateRange = 'All', dateStart = '', dateEnd = '' } = {}) => {
  if (!requests) return [];
  if (dateRange === 'All' && !dateStart && !dateEnd) return requests;

  let start = null;
  let end = null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (dateRange) {
    case 'This month': {
      // current month: start of current month to start of next month (exclusive)
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    }
    case 'Last month': {
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      start = new Date(startOfCurrentMonth);
      start.setMonth(start.getMonth() - 1); // first day of previous month
      end = new Date(startOfCurrentMonth); // first day of current month (exclusive end)
      break;
    }
    case 'Last 7 days':
      start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
      end = new Date(startOfToday);
      end.setDate(end.getDate() + 1);
      break;
    case 'Last 30 days':
      start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      end = new Date(startOfToday);
      end.setDate(end.getDate() + 1);
      break;
    case 'Last 3 months': {
      start = new Date(startOfToday);
      start.setMonth(start.getMonth() - 3);
      end = new Date(startOfToday);
      end.setDate(end.getDate() + 1);
      break;
    }
    case 'Last 6 months': {
      start = new Date(startOfToday);
      start.setMonth(start.getMonth() - 6);
      end = new Date(startOfToday);
      end.setDate(end.getDate() + 1);
      break;
    }
    case 'This year':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    case 'Last year':
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear(), 0, 1);
      break;
    case 'Custom':
    default:
      if (dateStart) start = new Date(dateStart);
      if (dateEnd) {
        end = new Date(dateEnd);
        end.setDate(end.getDate() + 1); // inclusive end date
      }
      break;
  }

  return requests.filter((req) => {
    const ts = req.created_at ? new Date(req.created_at) : null;
    if (!ts || isNaN(ts)) return false;
    if (start && ts < start) return false;
    if (end && ts >= end) return false;
    return true;
  });
};
