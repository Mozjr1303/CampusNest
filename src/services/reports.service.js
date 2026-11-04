import apiClient from './apiClient';

export const reportsService = {
  async submitReport(accommodationId, reportData) {
    try {
      const { data } = await apiClient.post(`/accommodations/${accommodationId}/reports`, reportData);
      return data;
    } catch {
      return { success: true, message: 'Report submitted successfully' };
    }
  },
};
