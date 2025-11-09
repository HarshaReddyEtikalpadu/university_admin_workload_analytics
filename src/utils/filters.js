/**
 * Filter requests based on user role
 */
export const filterByRole = (requests, user) => {
  if (!requests || !user) return [];
  
  switch (user.role) {
    case 'admin':
      // Individual Admin: Show only requests assigned to this admin
      return requests.filter(req => 
        Number(req.assigned_admin_id) === user.adminId
      );
    
    case 'manager':
      // Department Manager: Show only requests from their department
      return requests.filter(req => 
        Number(req.department_id) === user.departmentId
      );
    
    case 'analyst':
      // System Analyst: Show all requests
      return requests;
    
    default:
      return requests;
  }
};

/**
 * Filter requests by department
 */
export const filterByDepartment = (requests, department) => {
  if (!requests) return [];
  if (!department || department === 'All') return requests;
  
  return requests.filter(req => req.department_name === department);
};

/**
 * Filter requests by status
 */
export const filterByStatus = (requests, status) => {
  if (!requests) return [];
  if (!status || status === 'All') return requests;
  
  return requests.filter(req => req.status === status);
};

/**
 * Filter requests by priority
 */
export const filterByPriority = (requests, priority) => {
  if (!requests) return [];
  if (!priority || priority === 'All') return requests;
  
  return requests.filter(req => req.priority === priority);
};

/**
 * Filter requests by type
 */
export const filterByType = (requests, type) => {
  if (!requests) return [];
  if (!type || type === 'All') return requests;
  
  return requests.filter(req => req.request_type === type);
};

/**
 * Search requests by query string
 */
export const searchRequests = (requests, query) => {
  if (!requests) return [];
  if (!query || query.trim() === '') return requests;
  
  const searchTerm = query.toLowerCase().trim();
  
  return requests.filter(req => {
    const requestId = String(req.request_id || '').toLowerCase();
    const requestNumber = String(req.request_number || '').toLowerCase();
    const type = String(req.request_type || '').toLowerCase();
    const department = String(req.department_name || '').toLowerCase();
    const status = String(req.status || '').toLowerCase();
    const adminName = String(req.assigned_admin_name || '').toLowerCase();
    
    return (
      requestId.includes(searchTerm) ||
      requestNumber.includes(searchTerm) ||
      type.includes(searchTerm) ||
      department.includes(searchTerm) ||
      status.includes(searchTerm) ||
      adminName.includes(searchTerm)
    );
  });
};

/**
 * Apply all filters to requests
 */
export const applyAllFilters = (requests, user, filters) => {
  if (!requests) return [];
  
  let filtered = [...requests];
  
  // First, apply role-based filter
  filtered = filterByRole(filtered, user);
  
  // Then apply other filters
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
  
  if (filters.search) {
    filtered = searchRequests(filtered, filters.search);
  }
  
  return filtered;
};
