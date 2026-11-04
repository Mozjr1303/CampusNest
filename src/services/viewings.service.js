import apiClient from './apiClient';
import { REAL_VIEWINGS } from '../data/accommodationsData';

const VIEWINGS_KEY = 'campusnest_viewings';

function getStoredViewings() {
  try {
    const raw = localStorage.getItem(VIEWINGS_KEY);
    if (!raw) {
      localStorage.setItem(VIEWINGS_KEY, JSON.stringify(REAL_VIEWINGS));
      return REAL_VIEWINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : REAL_VIEWINGS;
  } catch {
    return REAL_VIEWINGS;
  }
}

export const viewingsService = {
  async requestViewing(accommodationId, viewingData) {
    try {
      const { data } = await apiClient.post(`/accommodations/${accommodationId}/viewings`, viewingData);
      return data;
    } catch {
      // Offline fallback
    }

    const viewings = getStoredViewings();
    const newViewing = {
      id: `view-${Date.now()}`,
      accommodationId,
      ...viewingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    viewings.unshift(newViewing);
    try {
      localStorage.setItem(VIEWINGS_KEY, JSON.stringify(viewings));
    } catch {
      // Ignore localStorage errors
    }
    return newViewing;
  },

  async getViewings() {
    try {
      const { data } = await apiClient.get('/student/viewings');
      return data;
    } catch {
      // Offline fallback
    }
    return getStoredViewings();
  },

  async cancelViewing(viewingId) {
    try {
      const { data } = await apiClient.post(`/viewings/${viewingId}/cancel`);
      return data;
    } catch {
      // Offline fallback
    }

    const viewings = getStoredViewings().map((v) =>
      v.id === viewingId ? { ...v, status: 'cancelled' } : v
    );
    try {
      localStorage.setItem(VIEWINGS_KEY, JSON.stringify(viewings));
    } catch {
      // Ignore localStorage errors
    }
    return { success: true, message: 'Viewing cancelled' };
  },
};
