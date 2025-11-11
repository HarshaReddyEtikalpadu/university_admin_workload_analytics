import { useState } from 'react';
import { Bell, Settings, LogOut, Search, User } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

const Header = ({ user, onLogout, onSearch, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

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
        return 'Department Manager';
      case 'analyst':
        return 'System Analyst';
      default:
        return 'User';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 z-50 flex items-center px-6 shadow-sm">
      {/* Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-silverleaf-blue to-primary-blue rounded-lg flex items-center justify-center shadow">
          <span className="text-white font-bold text-xl">SA</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{APP_NAME}</h1>
          <p className="text-xs text-gray-500">Admin Dashboard</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search requests, departments, admins..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Right Side: profile + logout aligned right */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{getRoleDisplay(user?.role)}</p>
          </div>
        </div>

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
