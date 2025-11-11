import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { DataProvider, useData } from './context/DataContext';
import { SettingsProvider } from './context/SettingsContext';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Reports from './pages/Reports';
import LoginPage from './components/LoginPage';
import Footer from './components/Footer';
import StatusBar from './components/StatusBar';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('dashboardUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (selectedUser) => {
    setUser(selectedUser);
    try {
      sessionStorage.setItem('dashboardUser', JSON.stringify(selectedUser));
    } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    try {
      sessionStorage.removeItem('dashboardUser');
    } catch {}
  };

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  const AppRoutes = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const onLoginPage = location.pathname.startsWith('/login');
    const { data, loading, error } = useData();

    // If user logs in while on /login, push to dashboard
    useEffect(() => {
      if (user && onLoginPage) {
        navigate('/dashboard', { replace: true });
      }
    }, [user, onLoginPage, navigate]);

    // Only block non-login routes on loading/error
    if (!onLoginPage) {
      if (loading) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        );
      }
      if (error) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">!</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        );
      }
    }

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard user={user} data={data} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {user && <Footer />}
        {user && <StatusBar />}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <DataProvider>
          <SettingsProvider>
            <AppRoutes />
          </SettingsProvider>
        </DataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
