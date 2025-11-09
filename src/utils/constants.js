// App Constants
export const APP_NAME = 'Silverleaf Academy';
export const APP_SUBTITLE = 'Admin Workload Analysis Dashboard';

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
};

// Request Statuses
export const STATUSES = {
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PENDING: 'Pending',
  RESOLVED: 'Resolved',
};

// Priority Levels
export const PRIORITIES = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

// Request Types
export const REQUEST_TYPES = [
  'Document Verification',
  'Grade Change Request',
  'Enrollment Request',
  'Financial Aid Application',
  'Transcript Request',
  'Degree Audit',
  'Schedule Adjustment',
  'Permission Override',
  'Scholarship Application',
  'Academic Appeal',
];

// Departments
export const DEPARTMENTS = [
  'Registrar',
  'Finance',
  'Admissions',
  'Academic Affairs',
  'Student Services',
  'Human Resources',
  'IT Support',
];

// Chart Colors
export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];

// Demo Users
export const DEMO_USERS = [
  {
    id: 1,
    role: 'admin',
    name: 'John Smith',
    email: 'john.smith@silverleaf.edu',
    department: 'Registrar',
    departmentId: 101,
    adminId: 1,
  },
];

// Heatmap Color Thresholds
export const HEATMAP_THRESHOLDS = {
  LOW: { min: 0, max: 15, color: '#10B981' }, // Green
  MEDIUM: { min: 16, max: 25, color: '#F59E0B' }, // Yellow
  HIGH: { min: 26, max: 35, color: '#EF4444' }, // Orange
  PEAK: { min: 36, max: Infinity, color: '#DC2626' }, // Red
};

// Work Hours (8 AM - 5 PM)
export const WORK_HOURS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

// Weekdays
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
