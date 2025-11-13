import { useState } from 'react';
import { Bell, Settings, LogOut, Search, User } from 'lucide-react';
import { APP_NAME } from '../utils/constants';
import { useSettings } from '../context/SettingsContext';

const Header = ({ user, onLogout, onSearch, onSearchScope, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { settings } = useSettings();
  
  const isQuietNow = (() => {
    try {
      const now = new Date();
      const toMin = (s) => {
        const [hh, mm] = String(s || '00:00').split(':').map((n) => parseInt(n, 10) || 0);
        return hh * 60 + mm;
      };
      const start = toMin(settings.quietStart);
      const end = toMin(settings.quietEnd);
      const cur = now.getHours() * 60 + now.getMinutes();
      if (Number.isNaN(start) || Number.isNaN(end)) return false;
      // Handles overnight windows (e.g., 21:00 -> 07:00)
      return start <= end ? (cur >= start && cur < end) : (cur >= start || cur < end);
    } catch {
      return false;
    }
  })();

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

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

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 z-50 grid grid-cols-[auto,1fr,auto] items-center px-6 shadow-sm">
      {/* Logo and Title (left) */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-silverleaf-blue to-primary-blue rounded-lg flex items-center justify-center shadow">
          <span className="text-white font-bold text-xl">SA</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{APP_NAME}</h1>
          <p className="text-xs text-gray-500">Admin Dashboard</p>
        </div>
      </div>
      
      {/* Search Bar (center) */}
      <div className="flex items-center justify-center">
        <div className="flex items-stretch gap-2 max-w-2xl w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests, departments, admins..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue"
            defaultValue="All"
            onChange={(e) => onSearchScope && onSearchScope(e.target.value)}
            aria-label="Search scope"
          >
            <option>All</option>
            <option>Departments</option>
            <option>Requests</option>
            <option>Admins</option>
          </select>
        </div>
      </div>
      
      {/* Right Side */}
      <div className="flex items-center gap-4 justify-end">
        {/* Notifications */}
        <button
          className={`relative p-2 rounded-lg transition-colors ${isQuietNow ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`}
          title={isQuietNow ? 'Quiet hours active — notifications muted' : 'Notifications'}
          disabled={isQuietNow}
        >
          <Bell className="w-6 h-6 text-gray-600" />
          {!isQuietNow && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>

        {/* Settings */}
        <button onClick={() => onNavigate && onNavigate('settings')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-6 h-6 text-gray-600" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Jason West'}</p>
            <p className="text-xs text-gray-500">{getRoleDisplay(user?.role)}</p>
          </div>
        </div>

        {/* Quiet hours banner (subtle) */}
        {isQuietNow && (
          <div className="hidden md:block text-xs text-gray-500 px-3 py-1 rounded-full border border-gray-200">
            Quiet hours: {settings.quietStart}–{settings.quietEnd}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
