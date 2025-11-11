/**
 * Calculate mean (average) of an array
 */
export const calculateMean = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + Number(val), 0);
  return sum / arr.length;
};

/**
 * Calculate median of an array
 */
export const calculateMedian = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => Number(a) - Number(b));
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (Number(sorted[mid - 1]) + Number(sorted[mid])) / 2
    : Number(sorted[mid]);
};

/**
 * Calculate standard deviation
 */
export const calculateStdDev = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const mean = calculateMean(arr);
  const squaredDiffs = arr.map(val => Math.pow(Number(val) - mean, 2));
  const avgSquaredDiff = calculateMean(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
};

/**
 * Calculate mode (most frequent value)
 */
export const calculateMode = (arr) => {
  if (!arr || arr.length === 0) return null;
  const frequency = {};
  let maxFreq = 0;
  let mode = null;

  arr.forEach(val => {
    frequency[val] = (frequency[val] || 0) + 1;
    if (frequency[val] > maxFreq) {
      maxFreq = frequency[val];
      mode = val;
    }
  });

  return mode;
};

/**
 * Calculate all KPI metrics from requests data
 */
export const calculateKPIs = (requests) => {
  if (!requests || requests.length === 0) {
    return {
      totalRequests: 0,
      totalHours: 0,
      totalCost: 0,
      avgProcessingTime: 0,
      approvalRate: 0,
      rejectionRate: 0,
      pendingRequests: 0,
      errorRate: 0,
    };
  }

  const totalRequests = requests.length;
  const totalMinutes = requests.reduce((sum, req) => sum + (Number(req.processing_time_minutes) || 0), 0);
  const totalHours = totalMinutes / 60;
  
  // Assuming average hourly rate of $25
  const avgHourlyRate = 25;
  const totalCost = totalHours * avgHourlyRate;
  
  const avgProcessingTime = calculateMean(requests.map(r => Number(r.processing_time_minutes) || 0));
  
  const approved = requests.filter(r => r.status === 'Approved').length;
  const rejected = requests.filter(r => r.status === 'Rejected').length;
  const pending = requests.filter(r => r.status === 'Pending').length;
  const resolved = requests.filter(r => r.status === 'Resolved').length;
  
  const approvalRate = resolved > 0 ? (approved / resolved) * 100 : 0;
  const rejectionRate = resolved > 0 ? (rejected / resolved) * 100 : 0;
  
  const totalErrors = requests.reduce((sum, req) => sum + (Number(req.error_count) || 0), 0);
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

  return {
    totalRequests,
    totalHours: parseFloat(totalHours.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    avgProcessingTime: parseFloat(avgProcessingTime.toFixed(2)),
    approvalRate: parseFloat(approvalRate.toFixed(2)),
    rejectionRate: parseFloat(rejectionRate.toFixed(2)),
    pendingRequests: pending,
    errorRate: parseFloat(errorRate.toFixed(2)),
  };
};

/**
 * Compute resolution time in minutes using timestamps; falls back to processing_time_minutes.
 */
export const getResolutionMinutes = (req, useTimestamp = true) => {
  if (useTimestamp) {
    const created = req?.created_at ? new Date(req.created_at) : null;
    const resolved = req?.resolved_at ? new Date(req.resolved_at) : null;
    if (created && resolved && !isNaN(created) && !isNaN(resolved)) {
      return Math.max(0, (resolved.getTime() - created.getTime()) / 60000);
    }
  }
  return Number(req?.processing_time_minutes) || 0;
};

/**
 * Average resolution time in minutes for resolved/approved items based on timestamps.
 */
export const getAvgResolutionMinutes = (requests, useTimestamp = true) => {
  if (!requests) return 0;
  const done = requests.filter((r) => r.status === 'Approved' || r.status === 'Resolved');
  if (done.length === 0) return 0;
  const minutes = done.map((r) => getResolutionMinutes(r, useTimestamp));
  return parseFloat(calculateMean(minutes).toFixed(0));
};

/**
 * SLA compliance percentage using timestamp-based resolution minutes threshold.
 */
export const getSLACompliance = (requests, thresholdMinutes = 60, useTimestamp = true) => {
  if (!requests) return 0;
  const done = requests.filter((r) => r.status === 'Approved' || r.status === 'Resolved');
  if (done.length === 0) return 0;
  const within = done.filter((r) => getResolutionMinutes(r, useTimestamp) <= thresholdMinutes).length;
  return parseFloat(((within / done.length) * 100).toFixed(0));
};

/**
 * Monthly volume of requests created in current month (all statuses)
 */
export const getMonthlyVolume = (requests) => {
  if (!requests) return 0;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return requests.filter((r) => r.created_at && new Date(r.created_at) >= start).length;
};

/**
 * Monthly cost using admins hourly_rate, defaultRate if missing.
 */
export const getMonthlyCost = (requests, admins = [], defaultRate = 25, useTimestamp = true) => {
  if (!requests) return 0;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const rateById = new Map();
  admins?.forEach((a) => rateById.set(Number(a.admin_id) || a.admin_id, Number(a.hourly_rate) || defaultRate));
  const monthReqs = requests.filter((r) => r.created_at && new Date(r.created_at) >= start);
  const total = monthReqs.reduce((sum, r) => {
    const mins = getResolutionMinutes(r, useTimestamp);
    const rate = rateById.get(Number(r.assigned_admin_id)) ?? defaultRate;
    return sum + (mins / 60) * rate;
  }, 0);
  return parseFloat(total.toFixed(2));
};

/**
 * Get request data grouped by type for pie chart
 */
export const getRequestTypeData = (requests) => {
  if (!requests || requests.length === 0) return [];
  
  const typeCounts = {};
  requests.forEach(req => {
    const type = req.request_type || 'Unknown';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return Object.entries(typeCounts).map(([name, value]) => ({
    name,
    value,
  }));
};

/**
 * Get average processing time by request type for bar chart
 */
export const getAvgTimeByType = (requests) => {
  if (!requests || requests.length === 0) return [];
  
  const typeTimes = {};
  const typeCounts = {};
  
  requests.forEach(req => {
    const type = req.request_type || 'Unknown';
    const time = Number(req.processing_time_minutes) || 0;
    
    if (!typeTimes[type]) {
      typeTimes[type] = 0;
      typeCounts[type] = 0;
    }
    
    typeTimes[type] += time;
    typeCounts[type] += 1;
  });

  return Object.entries(typeTimes).map(([name, totalTime]) => ({
    name,
    value: parseFloat((totalTime / typeCounts[name]).toFixed(2)),
  }));
};

/**
 * Get monthly trend data for line chart (last 6 months)
 */
export const getTrendData = (requests) => {
  if (!requests || requests.length === 0) return [];
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthCounts = {};
  
  months.forEach(month => {
    monthCounts[month] = 0;
  });
  
  requests.forEach(req => {
    if (req.created_at) {
      const date = new Date(req.created_at);
      const monthIndex = date.getMonth();
      if (monthIndex >= 0 && monthIndex < 6) {
        const monthName = months[monthIndex];
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    }
  });

  return months.map(month => ({
    month,
    requests: monthCounts[month] || 0,
  }));
};

/**
 * Get heatmap data (hour x day matrix)
 */
export const getHeatmapData = (requests) => {
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; // 8 AM - 5 PM
  const days = [1, 2, 3, 4, 5]; // Mon-Fri
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const heatmap = {};
  
  // Initialize all cells to 0
  hours.forEach(hour => {
    days.forEach(day => {
      const key = `${day}-${hour}`;
      heatmap[key] = 0;
    });
  });
  
  // Count requests by hour and day
  requests.forEach(req => {
    if (req.created_at) {
      const date = new Date(req.created_at);
      const hour = date.getHours();
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Only count weekdays (Monday = 1 to Friday = 5)
      if (day >= 1 && day <= 5 && hour >= 8 && hour <= 17) {
        const key = `${day}-${hour}`;
        heatmap[key] = (heatmap[key] || 0) + 1;
      }
    }
  });
  
  // Convert to array format for rendering
  return hours.map(hour => {
    const row = {
      hour: hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`,
      hours: hour,
    };
    
    days.forEach(day => {
      const key = `${day}-${hour}`;
      row[dayNames[day - 1]] = heatmap[key] || 0;
    });
    
    return row;
  });
};

/**
 * Get department workload statistics
 */
export const getDepartmentWorkload = (requests) => {
  if (!requests || requests.length === 0) return [];
  
  const deptStats = {};
  
  requests.forEach(req => {
    const dept = req.department_name || 'Unknown';
    if (!deptStats[dept]) {
      deptStats[dept] = {
        name: dept,
        total: 0,
        totalTime: 0,
        avgTime: 0,
      };
    }
    
    deptStats[dept].total += 1;
    deptStats[dept].totalTime += Number(req.processing_time_minutes) || 0;
  });
  
  return Object.values(deptStats).map(dept => ({
    ...dept,
    avgTime: parseFloat((dept.totalTime / dept.total).toFixed(2)),
  }));
};

/**
 * Get descriptive statistics
 */
export const getDescriptiveStats = (requests) => {
  if (!requests || requests.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      mode: null,
    };
  }
  
  const processingTimes = requests.map(r => Number(r.processing_time_minutes) || 0);
  const requestTypes = requests.map(r => r.request_type || 'Unknown');
  
  return {
    mean: parseFloat(calculateMean(processingTimes).toFixed(2)),
    median: parseFloat(calculateMedian(processingTimes).toFixed(2)),
    stdDev: parseFloat(calculateStdDev(processingTimes).toFixed(2)),
    mode: calculateMode(requestTypes),
  };
};
