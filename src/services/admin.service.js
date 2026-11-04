import apiClient from './apiClient';

export const adminService = {
  async getStats() {
    const { data } = await apiClient.get('/admin/stats');
    return data.stats;
  },

  async getReports() {
    const { data } = await apiClient.get('/admin/reports');
    return data.data;
  },

  async getHostels(status = 'all') {
    const { data } = await apiClient.get('/admin/hostels', { params: { status } });
    return data.data;
  },

  async approveHostel(hostelId, { reason } = {}) {
    const { data } = await apiClient.patch(`/admin/hostels/${hostelId}/approve`, { reason });
    return data;
  },

  async rejectHostel(hostelId, { reason }) {
    const { data } = await apiClient.patch(`/admin/hostels/${hostelId}/reject`, { reason });
    return data;
  },

  async updateReport(reportId, { status, adminNote }) {
    const { data } = await apiClient.patch(`/admin/reports/${reportId}`, { status, adminNote });
    return data;
  },

  async moderateListing(listingId, { action, reason }) {
    const { data } = await apiClient.patch(`/admin/listings/${listingId}/moderation`, { action, reason });
    return data;
  },

  async getUsers() {
    const { data } = await apiClient.get('/admin/users');
    return data.data;
  },

  async updateUserStatus(userId, { status, reason }) {
    const { data } = await apiClient.patch(`/admin/users/${userId}/status`, { status, reason });
    return data;
  },

  async recordVerification({ accommodationId, userId, checkType, status, notes }) {
    const { data } = await apiClient.post('/admin/verifications', {
      accommodationId,
      userId,
      checkType,
      status,
      notes,
    });
    return data;
  },

  async getAuditLogs() {
    const { data } = await apiClient.get('/admin/audit-logs');
    return data.data;
  },
};
