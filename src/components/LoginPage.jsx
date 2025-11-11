import { DEMO_USERS, APP_NAME, APP_SUBTITLE } from '../utils/constants';
import { User, Eye, EyeOff } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const DEMO_PASSWORD = 'Silverleaf@123';

const LoginPage = ({ onLogin }) => {
  const { data } = useData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  const demoAdmin = useMemo(() => {
    const a = data?.admins?.[0];
    if (a) {
      return {
        id: Number(a.admin_id) || a.admin_id,
        role: (a.role || 'admin').toLowerCase(),
        name: a.name,
        email: a.email,
        department: a.department_name || a.department,
        departmentId: Number(a.department_id) || a.department_id,
      };
    }
    return DEMO_USERS[0];
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const ok = email.trim().toLowerCase() === (demoAdmin.email || '').toLowerCase() && password === DEMO_PASSWORD;
    if (!ok) {
      setError('Invalid email or password for the demo account.');
      return;
    }
    if (onLogin) onLogin(demoAdmin);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
          {/* Left - Login form */}
          <div className="p-10">
            <div className="mb-8 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-silverleaf-blue to-primary-blue rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">★</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome again!</h2>
              <p className="text-gray-500 mt-1">Please enter your details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  placeholder={demoAdmin.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-gray-700">
                  <input type="checkbox" className="rounded border-gray-300" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <a className="text-gray-500 hover:text-gray-700" href="#">Forgot Password?</a>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
              )}

              <button type="submit" className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 transition-colors">
                Log In
              </button>

              {/* Remove demo hints for production-like experience */}
            </form>
            {/* No demo label shown */}
          </div>

          {/* Right - Brand panel */}
          <div className="bg-gray-100 p-10 flex items-center justify-center">
            <div className="w-full h-full max-w-md aspect-square bg-silverleaf-blue text-white rounded shadow flex items-center justify-center">
              <div className="text-center px-6">
                <h1 className="text-4xl font-bold">Silverleaf</h1>
                <p className="text-2xl mt-2">ACADEMY</p>
                <div className="h-px bg-white/40 my-4" />
                <p className="text-sm text-blue-100">The Future Starts Here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
