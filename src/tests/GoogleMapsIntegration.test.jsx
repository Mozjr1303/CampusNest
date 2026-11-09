import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GoogleMapLocation, { MALAWI_UNIVERSITY_COORDINATES } from '../components/maps/GoogleMapLocation';

describe('Google Maps Integration for Hostel Locations', () => {
  it('renders interactive map in view mode with accurate coordinates and Get Directions link', () => {
    const lat = -15.3789;
    const lng = 35.3289;
    const title = 'Sunrise Heights Executive Student Pod';
    const area = 'Chikanda Village, Zomba';

    render(
      <MemoryRouter>
        <GoogleMapLocation
          mode="view"
          latitude={lat}
          longitude={lng}
          title={title}
          area={area}
        />
      </MemoryRouter>
    );

    // Verify coordinates display
    expect(screen.getByText('Exact Coordinates:')).toBeInTheDocument();
    expect(screen.getByText(`${lat}, ${lng}`)).toBeInTheDocument();

    // Verify "Get Directions" link
    const directionsLink = screen.getByRole('link', { name: /get directions in google maps/i });
    expect(directionsLink).toBeInTheDocument();
    expect(directionsLink).toHaveAttribute(
      'href',
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    );
    expect(directionsLink).toHaveAttribute('target', '_blank');
  });

  it('handles missing coordinates gracefully in student view mode without random locations', () => {
    render(
      <MemoryRouter>
        <GoogleMapLocation
          mode="view"
          latitude={null}
          longitude={null}
          title="Unmapped Hostel"
          area="Chirunga, Zomba"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Location coordinates not set for this hostel')).toBeInTheDocument();
    expect(screen.getByText(/General area: Chirunga, Zomba/i)).toBeInTheDocument();
    expect(screen.getByText('Approximate Area:')).toBeInTheDocument();
  });

  it('provides interactive location picker for landlords with campus presets and coordinate inputs', () => {
    const mockChangeLocation = vi.fn();

    render(
      <MemoryRouter>
        <GoogleMapLocation
          mode="picker"
          latitude={null}
          longitude={null}
          title="New Student Pod"
          area="Chikanda"
          onChangeLocation={mockChangeLocation}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Pin Hostel Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Click or tap anywhere on the map/i)).toBeInTheDocument();

    // Test clicking a campus preset jumper (e.g. UNIMA)
    const unimaPresetBtn = screen.getByRole('button', { name: /UNIMA \(Zomba\)/i });
    expect(unimaPresetBtn).toBeInTheDocument();
    fireEvent.click(unimaPresetBtn);

    expect(mockChangeLocation).toHaveBeenCalledWith(
      MALAWI_UNIVERSITY_COORDINATES.unima.lat,
      MALAWI_UNIVERSITY_COORDINATES.unima.lng
    );

    // Test manual latitude and longitude input fields
    const latInput = screen.getByPlaceholderText('e.g. -15.378900');
    const lngInput = screen.getByPlaceholderText('e.g. 35.328900');

    fireEvent.change(latInput, { target: { value: '-15.800000' } });
    fireEvent.change(lngInput, { target: { value: '35.033000' } });

    expect(mockChangeLocation).toHaveBeenCalledWith(-15.8, 35.033);
  });
});
