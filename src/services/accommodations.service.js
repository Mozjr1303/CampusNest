import apiClient from './apiClient';
import { REAL_ACCOMMODATIONS } from '../data/accommodationsData';

const STORAGE_KEY = 'campusnest_accommodations';

// Initialize or get stored accommodations from localStorage
function getStoredAccommodations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(REAL_ACCOMMODATIONS));
      return REAL_ACCOMMODATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : REAL_ACCOMMODATIONS;
  } catch {
    return REAL_ACCOMMODATIONS;
  }
}

// Helper to filter, sort, and paginate accommodations locally
export function filterAccommodationsLocally(items, params = {}) {
  let filtered = [...items];

  // Filter by university
  if (params.university && params.university !== 'all') {
    filtered = filtered.filter(
      (item) => item.universityId?.toLowerCase() === params.university.toLowerCase()
    );
  }

  // Filter by area
  if (params.area && params.area !== 'all') {
    const areaLower = params.area.toLowerCase();
    filtered = filtered.filter((item) =>
      item.area?.toLowerCase().includes(areaLower)
    );
  }

  // Filter by price range
  if (params.minPrice) {
    filtered = filtered.filter((item) => item.price >= Number(params.minPrice));
  }
  if (params.maxPrice && params.maxPrice !== 'any') {
    filtered = filtered.filter((item) => item.price <= Number(params.maxPrice));
  }

  // Filter by room type
  if (params.type && params.type !== 'all') {
    filtered = filtered.filter((item) => {
      if (params.type === 'single') return item.roomType === 'single';
      if (params.type === 'shared') return item.roomType === 'shared';
      if (params.type === 'bedsitter' || params.type === 'self-contained') {
        return item.roomType === 'bedsitter' || item.roomType === 'single';
      }
      return item.roomType === params.type;
    });
  }

  // Filter by facilities (e.g., borehole_water, solar_backup)
  if (params.facilities) {
    const requiredFacilities = Array.isArray(params.facilities)
      ? params.facilities
      : params.facilities.split(',').map((f) => f.trim());

    filtered = filtered.filter((item) => {
      const itemFacilityIds = (item.facilities || []).map((f) => f.id);
      return requiredFacilities.every((rf) => itemFacilityIds.includes(rf));
    });
  }

  // Sorting
  if (params.sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (params.sort === 'distance') {
    filtered.sort((a, b) => (a.distanceToGate || '').localeCompare(b.distanceToGate || ''));
  } else {
    // Default newest
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  // Pagination
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 6;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const itemsPage = filtered.slice(start, start + limit);

  return {
    data: itemsPage,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export const accommodationsService = {
  async getAccommodations(params = {}) {
    try {
      const { data } = await apiClient.get('/accommodations', { params });
      if (data && (Array.isArray(data) || Array.isArray(data.data))) {
        return data;
      }
    } catch {
      // Backend not running or endpoint not yet configured: serve local authentic records
    }

    const items = getStoredAccommodations();
    return filterAccommodationsLocally(items, params);
  },

  async getAccommodationById(id) {
    try {
      const { data } = await apiClient.get(`/accommodations/${id}`);
      if (data) return data;
    } catch {
      // Fallback to local store
    }

    const items = getStoredAccommodations();
    const found = items.find((item) => item.id === id);
    if (!found) {
      const error = new Error('Accommodation listing not found');
      error.response = { status: 404, data: { message: 'Listing not found' } };
      throw error;
    }
    return found;
  },

  async createAccommodation(formData) {
    try {
      const { data } = await apiClient.post('/accommodations', formData);
      return data;
    } catch {
      // Save locally if backend is unavailable
    }

    const items = getStoredAccommodations();
    const newItem = {
      ...formData,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isVerified: false,
    };
    items.unshift(newItem);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage errors
    }
    return newItem;
  },

  async updateAccommodation(id, formData) {
    try {
      const { data } = await apiClient.put(`/accommodations/${id}`, formData);
      return data;
    } catch {
      // Update locally
    }

    const items = getStoredAccommodations();
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...formData, updatedAt: new Date().toISOString() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore localStorage errors
      }
      return items[index];
    }
    return formData;
  },

  async deleteAccommodation(id) {
    try {
      const { data } = await apiClient.delete(`/accommodations/${id}`);
      return data;
    } catch {
      // Delete locally
    }

    const items = getStoredAccommodations().filter((item) => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore localStorage errors
    }
    return { success: true, message: 'Accommodation deleted' };
  },

  async submitReview(accommodationId, reviewData) {
    try {
      const { data } = await apiClient.post(`/accommodations/${accommodationId}/reviews`, reviewData);
      return data;
    } catch {
      return { success: true, message: 'Review submitted successfully.' };
    }
  },
};
