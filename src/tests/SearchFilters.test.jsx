import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ExplorePage from '../pages/ExplorePage';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { accommodationsService } from '../services/accommodations.service';
import apiClient from '../services/apiClient';

function renderExplorePage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ExplorePage />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('Search Filters and Exploration Component', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('renders search filter controls and budget slider', async () => {
    renderExplorePage();

    expect(screen.getByText(/Refine Search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monthly budget in Malawi Kwacha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Filters/i })).toBeInTheDocument();
  });

  it('renders university selection chips for UNIMA, MUST, KUHeS, LUANAR, and MZUNI', () => {
    renderExplorePage();

    expect(screen.getByText(/UNIMA \(University of Malawi\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MUST \(Malawi University of Science and Tech\)/i)).toBeInTheDocument();
    expect(screen.getByText(/KUHeS \(Kamuzu University of Health Sciences\)/i)).toBeInTheDocument();
    expect(screen.getByText(/LUANAR \(Lilongwe University of Agriculture & Natural Resources\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MZUNI \(Mzuzu University\)/i)).toBeInTheDocument();
    expect(screen.getByText(/DMI \(DMI St. John the Baptist University\)/i)).toBeInTheDocument();
  });

  it('calls accommodations service API with requested query parameters', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        data: [{ id: '1', universityId: 'unima', price: 45000, roomType: 'single' }],
        pagination: { total: 1, page: 1, limit: 6, totalPages: 1 },
      },
    });

    const results = await accommodationsService.getAccommodations({ university: 'unima', maxPrice: '50000' });
    expect(getSpy).toHaveBeenCalledWith('/accommodations', {
      params: { university: 'unima', maxPrice: '50000' },
    });
    expect(results.data.length).toBe(1);
    getSpy.mockRestore();
  });

  it('clears all filters when clicking Reset Filters', async () => {
    renderExplorePage();

    const resetBtn = screen.getByRole('button', { name: /Reset Filters/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByLabelText(/Monthly budget in Malawi Kwacha/i)).toHaveValue('120000');
    });
  });
});

describe('Application routing', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('campusnest_token', 'mock-token');
    localStorage.setItem('campusnest_user', JSON.stringify({ id: 'user-1', fullName: 'Test User' }));
    window.history.pushState({}, '', '/landlord/listings/new');
  });

  it('renders the landlord listing creation route', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', { name: /Create New Accommodation Listing/i })).toBeInTheDocument();
  });
});
