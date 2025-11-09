import { REQUEST_TYPES, DEPARTMENTS, STATUSES, PRIORITIES, DEMO_USERS } from './constants';

/**
 * Generate random integer between min and max (inclusive)
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate random date within last 6 months
 */
const randomDate = () => {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
};

/**
 * Generate date with time bias (more requests Mon-Thu 9-11 AM)
 */
const randomDateWithBias = () => {
  const date = randomDate();
  const day = date.getDay();
  
  // Bias towards Monday-Thursday (1-4)
  if (Math.random() > 0.3) {
    const targetDay = randomInt(1, 4); // Mon-Thu
    const daysDiff = targetDay - day;
    date.setDate(date.getDate() + daysDiff);
  }
  
  // Bias towards 9-11 AM
  if (Math.random() > 0.4) {
    date.setHours(randomInt(9, 11), randomInt(0, 59), 0, 0);
  } else {
    date.setHours(randomInt(8, 17), randomInt(0, 59), 0, 0);
  }
  
  return date;
};

/**
 * Generate sample requests data
 */
export const generateSampleData = () => {
  const requests = [];
  const numRequests = 250;
  
  const statusWeights = {
    'Approved': 0.45,
    'Rejected': 0.15,
    'Resolved': 0.30,
    'Pending': 0.10,
  };
  
  const priorityWeights = {
    'Critical': 0.10,
    'High': 0.25,
    'Medium': 0.45,
    'Low': 0.20,
  };
  
  const getWeightedRandom = (weights) => {
    const random = Math.random();
    let sum = 0;
    for (const [key, weight] of Object.entries(weights)) {
      sum += weight;
      if (random <= sum) {
        return key;
      }
    }
    return Object.keys(weights)[0];
  };
  
  for (let i = 1; i <= numRequests; i++) {
    const createdDate = randomDateWithBias();
    const processingTime = randomInt(20, 100);
    const resolvedDate = new Date(createdDate);
    resolvedDate.setMinutes(resolvedDate.getMinutes() + processingTime);
    
    const departmentIndex = randomInt(0, DEPARTMENTS.length - 1);
    const department = DEPARTMENTS[departmentIndex];
    const departmentId = 101 + departmentIndex;
    
    const requestType = REQUEST_TYPES[randomInt(0, REQUEST_TYPES.length - 1)];
    const status = getWeightedRandom(statusWeights);
    const priority = getWeightedRandom(priorityWeights);
    
    const adminId = randomInt(1, 5);
    const adminName = `Admin ${adminId}`;
    
    const errorCount = status === 'Rejected' ? randomInt(1, 3) : (Math.random() > 0.8 ? 1 : 0);
    const complexityScore = randomInt(1, 10);
    const manualStepsCount = randomInt(3, 15);
    const requiresManualReview = complexityScore > 6 || priority === 'Critical';
    
    requests.push({
      request_id: i,
      request_number: `REQ-${String(i).padStart(5, '0')}`,
      student_id: randomInt(1000, 9999),
      department_id: departmentId,
      department_name: department,
      request_type: requestType,
      priority: priority,
      status: status,
      assigned_admin_id: adminId,
      assigned_admin_name: adminName,
      created_at: createdDate.toISOString(),
      resolved_at: status !== 'Pending' ? resolvedDate.toISOString() : '',
      processing_time_minutes: processingTime,
      estimated_time_minutes: processingTime + randomInt(-10, 10),
      manual_steps_count: manualStepsCount,
      error_count: errorCount,
      requires_manual_review: requiresManualReview,
      complexity_score: complexityScore,
    });
  }
  
  // Generate admins data
  const admins = [];
  for (let i = 1; i <= 5; i++) {
    const deptIndex = randomInt(0, DEPARTMENTS.length - 1);
    admins.push({
      admin_id: i,
      name: `Admin ${i}`,
      email: `admin${i}@silverleaf.edu`,
      department_id: 101 + deptIndex,
      department_name: DEPARTMENTS[deptIndex],
      role: i === 1 ? 'Senior Admin' : 'Admin',
      hourly_rate: randomInt(20, 35),
      experience_years: randomInt(1, 10),
      specialization: REQUEST_TYPES[randomInt(0, REQUEST_TYPES.length - 1)],
      avg_tasks_per_day: randomInt(5, 20),
      efficiency_score: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)), // 0.6-1.0
    });
  }
  
  // Generate departments data
  const departments = DEPARTMENTS.map((name, index) => ({
    department_id: 101 + index,
    department_name: name,
    head_count: randomInt(5, 25),
    total_requests: requests.filter(r => r.department_name === name).length,
  }));
  
  // Generate request types data
  const requestTypes = REQUEST_TYPES.map((type) => {
    const typeRequests = requests.filter(r => r.request_type === type);
    return {
      type_name: type,
      total_count: typeRequests.length,
      avg_processing_time: typeRequests.length > 0
        ? parseFloat((typeRequests.reduce((sum, r) => sum + r.processing_time_minutes, 0) / typeRequests.length).toFixed(2))
        : 0,
    };
  });
  
  return {
    requests,
    admins,
    departments,
    requestTypes,
    workloadLog: [],
    dailySummary: [],
  };
};
