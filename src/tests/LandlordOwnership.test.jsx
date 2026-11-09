import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandlordDashboard from '../components/landlord/LandlordDashboard';
import { AuthContext } from '../context/AuthContext';
import * as apiClientModule from '../services/apiClient';

describe('Landlord Dashboard Property Ownership Display', () => {
  const mockAccommodations = [
    {
      id: 'sh-001',
      landlordId: 'usr-landlord-1',
      title: 'Sunrise Heights Executive Student Pod',
      area: 'Chikanda Village, Zomba',
      price: 65000,
      availabilityStatus: 'available',
      verificationStatus: 'verified',
    },
    {
      id: 'ch-002',
      landlordId: 'usr-landlord-2',
      title: 'Chirunga Scholars Haven (Double Room)',
      area: 'Chirunga, Zomba',
      price: 42000,
      availabilityStatus: 'available',
      verificationStatus: 'verified',
    },
    {
      id: 'must-003',
      landlordId: 'usr-landlord-3',
      title: 'Goliati Palms Private Bed-Sitter',
      area: 'Goliati, Thyolo',
      price: 55000,
      availabilityStatus: 'pending',
      verificationStatus: 'unverified',
    },
  ];

  it('correctly labels properties for Landlord 1 (usr-landlord-1)', async () => {
    vi.spyOn(apiClientModule.default, 'get').mockResolvedValue({
      data: {
        listings: mockAccommodations,
        stats: { active: 1, pendingViewings: 0, archived: 0 },
      },
    });

    const landlordUser1 = {
      id: 'usr-landlord-1',
      fullName: 'Mr. B. Phiri',
      email: 'phiri@campusnest.mw',
      role: 'landlord',
    };

    render(
      <AuthContext.Provider value={{ user: landlordUser1 }}>
        <MemoryRouter>
          <LandlordDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // Wait for data load
    const elements = await screen.findAllByText('Sunrise Heights Executive Student Pod');
    expect(elements.length).toBeGreaterThan(0);

    // Verify "My Property" is rendered for Landlord 1's listing (desktop and mobile)
    const myPropertyBadges = screen.getAllByText('My Property');
    expect(myPropertyBadges.length).toBeGreaterThan(0);

    // Verify "Other Landlords' Properties" is rendered for listings by usr-landlord-2 and usr-landlord-3
    const otherLandlordBadges = screen.getAllByText("Other Landlords' Properties");
    expect(otherLandlordBadges.length).toBeGreaterThan(0);

    // Landlord 1 should see Edit for own property
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks.length).toBeGreaterThan(0);
    expect(editLinks[0]).toHaveAttribute('href', '/landlord/listings/sh-001/edit');

    // Landlord 1 should see "View Listing" for other landlords' properties
    const viewListingLinks = screen.getAllByRole('link', { name: /view listing/i });
    expect(viewListingLinks.length).toBeGreaterThan(0);
    expect(viewListingLinks.some((l) => l.getAttribute('href') === '/accommodation/ch-002')).toBe(true);
  });

  it('correctly labels properties for Landlord 2 (usr-landlord-2)', async () => {
    vi.spyOn(apiClientModule.default, 'get').mockResolvedValue({
      data: {
        listings: mockAccommodations,
        stats: { active: 1, pendingViewings: 0, archived: 0 },
      },
    });

    const landlordUser2 = {
      id: 'usr-landlord-2',
      fullName: 'Mrs. M. Banda',
      email: 'mbanda@campusnest.mw',
      role: 'landlord',
    };

    render(
      <AuthContext.Provider value={{ user: landlordUser2 }}>
        <MemoryRouter>
          <LandlordDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    const elements = await screen.findAllByText('Chirunga Scholars Haven (Double Room)');
    expect(elements.length).toBeGreaterThan(0);

    // For Landlord 2, Chirunga Scholars Haven is "My Property"
    const myPropertyBadges = screen.getAllByText('My Property');
    expect(myPropertyBadges.length).toBeGreaterThan(0);

    // Sunrise Heights (usr-landlord-1) is "Other Landlords' Properties" for Landlord 2
    const otherLandlordBadges = screen.getAllByText("Other Landlords' Properties");
    expect(otherLandlordBadges.length).toBeGreaterThan(0);

    // Landlord 2 should see Edit only for ch-002
    const editLinks = screen.getAllByRole('link', { name: /edit/i });
    expect(editLinks.length).toBeGreaterThan(0);
    expect(editLinks[0]).toHaveAttribute('href', '/landlord/listings/ch-002/edit');

    // Landlord 2 should see View Listing for sh-001 (Sunrise Heights)
    const viewListingLinks = screen.getAllByRole('link', { name: /view listing/i });
    expect(viewListingLinks.length).toBeGreaterThan(0);
    expect(viewListingLinks.some((l) => l.getAttribute('href') === '/accommodation/sh-001')).toBe(true);
  });
});
