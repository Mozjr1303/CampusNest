import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    password: '',
    role: 'student',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { ...formData };

      const response = await axios.post(endpoint, payload);

      localStorage.setItem('token', response.data.token || '');
      localStorage.setItem('role', response.data.role || formData.role || 'student');

      const userRole = response.data.role || formData.role || 'student';

      if (userRole === 'landlord') {
        navigate('/landlord/dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 w-full">
      <div className="max-w-md w-full space-y-6 bg-surface-container-lowest p-5 sm:p-8 rounded-2xl shadow-xs border border-outline-variant/30">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">lock</span>
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-heading font-extrabold text-on-surface tracking-tight">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-on-surface-variant">
            {isLogin
              ? 'Access your listings, bookings, and account settings.'
              : 'Join and manage your accommodation or property listings.'}
          </p>
        </div>

        <div className="flex rounded-xl bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-heading font-bold transition-all ${
              isLogin
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-heading font-bold transition-all ${
              !isLogin
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-error-container p-3.5 text-xs sm:text-sm text-on-error-container" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="phone_number" className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+265 99 123 4567"
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Register As
              </label>
              <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl border border-outline-variant/30 gap-1">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'student' }))}
                  className={`py-2.5 px-3 rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'student'
                      ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-primary/20'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">school</span>
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'landlord' }))}
                  className={`py-2.5 px-3 rounded-lg text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'landlord'
                      ? 'bg-surface-container-lowest text-secondary shadow-xs ring-1 ring-secondary/20'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">real_estate_agent</span>
                  <span>Landlord / Host</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="inline-flex items-center gap-2 text-on-surface-variant cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" />
                <span>Remember me</span>
              </label>
              <Link to="/faq" className="text-primary hover:underline font-semibold">
                Need help?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex justify-center items-center px-4 rounded-xl shadow-xs text-sm font-heading font-bold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed active:scale-98 transition-all"
          >
            {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}
