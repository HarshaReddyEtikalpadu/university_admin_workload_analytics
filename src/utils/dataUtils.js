// Common header variations we'll accept
const headerVariants = {
  // Request headers
  'request_id': ['requestid', 'request-id', 'id'],
  'request_number': ['requestnumber', 'request-number', 'number', 'req_num'],
  'student_id': ['studentid', 'student-id'],
  'department_id': ['departmentid', 'department-id', 'dept_id'],
  'department_name': ['departmentname', 'department-name', 'dept_name', 'department'],
  'request_type': ['requesttype', 'request-type', 'type'],
  'priority': ['priority_level', 'prioritylevel'],
  'status': ['request_status', 'requeststatus'],
  'assigned_admin_id': ['adminid', 'admin_id', 'assigned_to_id'],
  'assigned_admin_name': ['adminname', 'admin_name', 'assigned_to'],
  'created_at': ['createdat', 'created', 'date_created', 'timestamp'],
  'resolved_at': ['resolvedat', 'resolved', 'date_resolved', 'completion_time'],
  'processing_time_minutes': ['processingtime', 'processing_time', 'duration_minutes', 'time_taken'],
  
  // Department headers
  'department_code': ['deptcode', 'dept_code', 'code'],
  'department_head': ['head', 'manager', 'dept_head'],
  
  // Admin headers
  'admin_id': ['id', 'adminid'],
  'admin_name': ['name', 'fullname', 'admin'],
  'role': ['admin_role', 'position', 'title'],
  'department': ['dept', 'department_name'],
};

/**
 * Normalize CSV headers to our expected format
 */
export const normalizeHeaders = (headers = []) => {
  return headers.map(h => {
    const clean = String(h).toLowerCase().trim().replace(/[\s-]/g, '_');
    // Check if this header has any known variants
    for (const [standard, variants] of Object.entries(headerVariants)) {
      if (clean === standard || variants.includes(clean)) {
        return standard;
      }
    }
    return clean;
  });
};

/**
 * Detect file type from headers or content
 */
export const detectFileType = (headers = [], rows = []) => {
  const normalizedHeaders = normalizeHeaders(headers);
  
  // Request indicators
  if (
    normalizedHeaders.includes('request_id') ||
    normalizedHeaders.includes('request_number') ||
    normalizedHeaders.includes('request_type')
  ) {
    return 'requests';
  }
  
  // Admin indicators
  if (
    normalizedHeaders.includes('admin_id') ||
    normalizedHeaders.includes('admin_name') ||
    (normalizedHeaders.includes('role') && rows.some(r => 
      String(r.role).toLowerCase().includes('admin')
    ))
  ) {
    return 'admins';
  }
  
  // Department indicators
  if (
    normalizedHeaders.includes('department_code') ||
    (normalizedHeaders.includes('department_name') && !normalizedHeaders.includes('request_id'))
  ) {
    return 'departments';
  }
  
  // RequestType indicators (usually simple type + description structure)
  if (
    normalizedHeaders.includes('type_code') ||
    normalizedHeaders.includes('type_name') ||
    (normalizedHeaders.length <= 3 && normalizedHeaders.includes('description'))
  ) {
    return 'requestTypes';
  }
  
  // WorkloadLog indicators (usually time-series data)
  if (
    normalizedHeaders.includes('timestamp') ||
    normalizedHeaders.includes('admin_id') &&
    (normalizedHeaders.includes('workload') || normalizedHeaders.includes('tasks'))
  ) {
    return 'workloadLog';
  }
  
  // DailySummary indicators
  if (
    normalizedHeaders.includes('date') &&
    (normalizedHeaders.includes('total_requests') || normalizedHeaders.includes('daily_workload'))
  ) {
    return 'dailySummary';
  }
  
  return null; // unknown type
};

/**
 * Validate required fields are present (after normalization)
 */
export const validateRequiredFields = (fileType, headers = []) => {
  const normalized = normalizeHeaders(headers);
  
  const requirements = {
    'requests': [
      'request_id',
      'request_type',
      'status',
      'assigned_admin_id'
    ],
    'admins': [
      'admin_id',
      'admin_name'
    ],
    'departments': [
      'department_id',
      'department_name'
    ],
  };
  
  const required = requirements[fileType];
  if (!required) return true; // no strict requirements
  
  return required.every(field => normalized.includes(field));
};

/**
 * Map row data to normalized structure
 */
export const normalizeRow = (row, headers) => {
  const normalized = {};
  const normalizedHeaders = normalizeHeaders(headers);
  
  headers.forEach((h, i) => {
    const normalizedHeader = normalizedHeaders[i];
    if (normalizedHeader && row[h] !== undefined) {
      normalized[normalizedHeader] = row[h];
    }
  });
  
  return normalized;
};