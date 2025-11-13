import { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  FileText, 
  Users, 
  Settings, 
  Filter,
  Calendar,
  ChevronDown,
  Eraser,
  Lightbulb
} from 'lucide-react';
import { DEPARTMENTS, STATUSES, PRIORITIES } from '../utils/constants';

const Sidebar = ({ user, filters, onFilterChange, onNavigate, onResetFilters, activeSection, departments }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'Individual Admin';
      case 'manager':
        return 'Senior Manager';
      case 'analyst':
        return 'System Analyst';
      default:
        return 'User';
    }
  };

  const showTeam = user?.role === 'manager' || user?.role === 'analyst';
  const hasActiveFilters = !!filters && (
    (filters.department && filters.department !== 'All') ||
    (filters.status && filters.status !== 'All') ||
    (filters.priority && filters.priority !== 'All') ||
    (filters.type && filters.type !== 'All') ||
    (filters.search && String(filters.search).trim() !== '') ||
    (filters.dateRange && filters.dateRange !== 'All') ||
    (filters.dateStart && filters.dateStart !== '') ||
    (filters.dateEnd && filters.dateEnd !== '')
  );

  const isActive = (key) => activeSection === key;

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
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Jason West'}</p>
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
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg font-medium ${isActive('dashboard') ? 'bg-primary-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              {!isCollapsed && <span>Dashboard</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('analytics') ? 'bg-primary-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <BarChart3 className="w-5 h-5" />
              {!isCollapsed && <span>Analytics</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('recommendations')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('recommendations') ? 'bg-primary-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Lightbulb className="w-5 h-5" />
              {!isCollapsed && <span>Recommendations</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('tasks')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('tasks') ? 'bg-primary-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <ClipboardList className="w-5 h-5" />
              {!isCollapsed && <span>{user?.role === 'admin' ? 'My Tasks' : 'Tasks'}</span>}
            </button>
          </li>
          <li>
            <button
              onClick={() => onNavigate && onNavigate('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('reports') ? 'bg-primary-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <FileText className="w-5 h-5" />
              {!isCollapsed && <span>Reports</span>}
            </button>
          </li>
          {showTeam && (
            <li>
              <button
                onClick={() => onNavigate && onNavigate('team')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('team') ? 'bg-primary-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Users className="w-5 h-5" />
                {!isCollapsed && <span>Team</span>}
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => onNavigate && onNavigate('calendar')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${isActive('calendar') ? 'bg-primary-blue text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              <Calendar className="w-5 h-5" />
              {!isCollapsed && <span>Calendar</span>}
            </button>
          </li>
          {/* Only show these three per request */}
        </ul>
      </nav>

      {/* Filters Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 pb-28">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
            {/* compact display of current date range */}
            <div className="ml-auto text-xs text-gray-500">
              {filters?.dateRange && filters?.dateRange !== 'All' ? filters.dateRange : 'All time'}
            </div>
          </div>

          <div className="space-y-4">
            {/* Department Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <select
                value={filters?.department || 'All'}
                onChange={(e) => onFilterChange && onFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
              >
                <option value="All">All Departments</option>
                {(departments && departments.length ? departments : DEPARTMENTS).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date Range</label>
              <div className="space-y-2">
                <select
                  value={filters?.dateRange || 'All'}
                  onChange={(e) => onFilterChange && onFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                >
                  <option value="This month">This month</option>
                  <option value="Last month">Last month</option>
                  <option value="Last 3 months">Last 3 months</option>
                  <option value="Last 6 months">Last 6 months</option>
                  <option value="Last year">Last year</option>
                  <option value="All">All Time</option>
                  <option value="Custom">Custom range</option>
                </select>
                {filters?.dateRange === 'Custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters?.dateStart || ''}
                      onChange={(e) => onFilterChange && onFilterChange('dateStart', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                    <input
                      type="date"
                      value={filters?.dateEnd || ''}
                      onChange={(e) => onFilterChange && onFilterChange('dateEnd', e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="space-y-2">
          <button
            disabled={!hasActiveFilters}
            onClick={() => onResetFilters && onResetFilters()}
            className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors ${hasActiveFilters ? 'bg-primary-blue text-white hover:bg-primary-blue/90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
            <Eraser className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Clear Filters</span>}
          </button>
          <button onClick={() => onNavigate && onNavigate('settings')} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">Settings</span>}
          </button>
          {/* Help removed per request */}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
