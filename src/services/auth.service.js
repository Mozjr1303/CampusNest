import apiClient from './apiClient';

export const authService = {
  async login(credentials) {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      if (data.token) {
        localStorage.setItem('campusnest_token', data.token);
        localStorage.setItem('campusnest_user', JSON.stringify(data.user || {}));
        localStorage.setItem('token', data.token);
        const userRole = data.role || data.user?.role || 'student';
        localStorage.setItem('role', userRole);
      }
      return data;
    } catch (err) {
      // If server responded with 4xx or 5xx, rethrow real response error
      if (err.response) throw err;

      // If network unreachable / offline: allow local session
      const user = {
        id: `usr-${Date.now()}`,
        fullName: 'Campus Scholar',
        email: credentials.identifier?.includes('@') ? credentials.identifier : 'student@campusnest.mw',
        phone: !credentials.identifier?.includes('@') ? credentials.identifier : '+265 991 600 735',
        role: credentials.role || 'student',
      };
      const token = `local-token-${Date.now()}`;
      localStorage.setItem('campusnest_token', token);
      localStorage.setItem('campusnest_user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      return { token, user, role: user.role };
    }
  },

  async register(registrationData) {
    try {
      const { data } = await apiClient.post('/auth/register', registrationData);
      if (data.token) {
        localStorage.setItem('campusnest_token', data.token);
        localStorage.setItem('campusnest_user', JSON.stringify(data.user || {}));
        localStorage.setItem('token', data.token);
        const userRole = data.role || data.user?.role || registrationData.role || 'student';
        localStorage.setItem('role', userRole);
      }
      return data;
    } catch (err) {
      if (err.response) throw err;

      // Offline / standalone fallback
      const user = {
        id: `usr-${Date.now()}`,
        fullName: registrationData.fullName,
        email: registrationData.email,
        phone: registrationData.phone,
        role: registrationData.role || 'student',
        university: registrationData.university,
      };
      const token = `local-token-${Date.now()}`;
      localStorage.setItem('campusnest_token', token);
      localStorage.setItem('campusnest_user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      return { token, user, role: user.role };
    }
  },

  async loginWithGoogle(credential = null) {
    try {
      const { data } = await apiClient.post('/auth/google', { credential });
      if (data.token) {
        localStorage.setItem('campusnest_token', data.token);
        localStorage.setItem('campusnest_user', JSON.stringify(data.user || {}));
        localStorage.setItem('token', data.token);
        const userRole = data.role || data.user?.role || 'student';
        localStorage.setItem('role', userRole);
      }
      return data;
    } catch (err) {
      if (err.response) throw err;

      const user = {
        id: `usr-${Date.now()}`,
        fullName: 'Google User',
        email: 'scholar@gmail.com',
        role: 'student',
      };
      const token = `local-token-${Date.now()}`;
      localStorage.setItem('campusnest_token', token);
      localStorage.setItem('campusnest_user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      return { token, user, role: user.role };
    }
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem('campusnest_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('campusnest_token') || localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('campusnest_token');
    localStorage.removeItem('campusnest_user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};
