import { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  HelpCircle,
  Filter,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { DEPARTMENTS, STATUSES, PRIORITIES } from '../utils/constants';

const Sidebar = ({ user, filters, onFilterChange, onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'Individual Admin';
      case 'manager':
        return 'Department Manager';
      case 'analyst':
        return 'System Analyst';
      default:
        return 'User';
    }
  };

  const showTeam = user?.role === 'manager' || user?.role === 'analyst';

  return (
    <aside className={`fixed left-0 top-20 bottom-0 bg-white border-r border-gray-200 z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} overflow-y-auto py-4`}>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-white font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{getRoleDisplay(user?.role)}</p>
              <p className="text-xs text-gray-400 truncate">{user?.department || 'Department'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left bg-primary-blue text-white rounded-lg font-medium"
            >
              <LayoutDashboard className="w-5 h-5" />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('tasks')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ClipboardList className="w-5 h-5" />
              {!isCollapsed && <span>{user?.role === 'admin' ? 'My Tasks' : 'Tasks'}</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              {!isCollapsed && <span>Analytics</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('reports')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              {!isCollapsed && <span>Reports</span>}
            </button>
          </li>
          {showTeam && (
            <li>
              <button
                onClick={() => onNavigate && onNavigate('team')}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                {!isCollapsed && <span>Team</span>}
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Filters Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
          </div>

          <div className="space-y-4">
            {/* Department Filter */}
            {user?.role === 'analyst' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                <select
                  value={filters?.department || 'All'}
                  onChange={(e) => onFilterChange && onFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="All">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters?.status || 'All'}
                onChange={(e) => onFilterChange && onFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="All">All Statuses</option>
                {Object.values(STATUSES).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                value={filters?.priority || 'All'}
                onChange={(e) => onFilterChange && onFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="All">All Priorities</option>
                {Object.values(PRIORITIES).map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Date Range (placeholder) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
              <button className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-50">
                <span className="text-gray-600">Last 6 months</span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">Settings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <HelpCircle className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">Help</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
