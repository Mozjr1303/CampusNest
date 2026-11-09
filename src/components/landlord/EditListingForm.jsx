// src/components/landlord/EditListingForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import GoogleMapLocation from '../maps/GoogleMapLocation';

export default function EditListingForm() {
  const { id } = useParams(); // Gets the accommodation ID from the URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    university_nearby: '',
    rent_mwk: '',
    deposit_mwk: '',
    room_type: 'Single Room',
    facilities: [],
    availability_status: 'available',
    latitude: null,
    longitude: null,
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const facilityOptions = ['WiFi', 'Water Included', 'Electricity (Prepaid/ESCOM)', 'Security Guard', 'Furnished', 'Kitchen'];

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      const response = await apiClient.get(`/accommodations/${id}`);
      const data = response.data?.data || response.data;
      setFormData({
        title: data.title || '',
        description: data.description || '',
        area: data.area || '',
        university_nearby: data.universityId || data.university_nearby || '',
        rent_mwk: data.price || data.rent_mwk || '',
        deposit_mwk: data.deposit || data.deposit_mwk || '',
        room_type: data.roomType || data.room_type || 'Single Room',
        facilities: Array.isArray(data.facilities)
          ? data.facilities.map((f) => (typeof f === 'string' ? f : f.label || f.id))
          : [],
        availability_status: data.availabilityStatus || data.availability_status || 'available',
        latitude: data.latitude != null ? Number(data.latitude) : null,
        longitude: data.longitude != null ? Number(data.longitude) : null,
      });
    } catch (err) {
      console.error('Error fetching listing details:', err);
      setError('Failed to load listing data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (facility) => {
    setFormData(prev => {
      const exists = prev.facilities?.includes(facility);
      if (exists) {
        return { ...prev, facilities: prev.facilities.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...(prev.facilities || []), facility] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        area: formData.area,
        university: formData.university_nearby,
        price: Number(formData.rent_mwk),
        deposit: Number(formData.deposit_mwk || 0),
        roomType: formData.room_type,
        facilities: formData.facilities.map((f) => ({ id: f.toLowerCase().replace(/\s+/g, '_'), label: f })),
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      await apiClient.patch(`/accommodations/${id}`, payload);
      navigate('/landlord/dashboard');
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-surface-container border-t-primary rounded-full animate-spin" />
        <span className="mt-3 font-heading text-xs font-semibold text-primary">
          Loading listing data...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs p-5 sm:p-8 border border-outline-variant/30">
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-on-surface mb-2">
          Edit Accommodation Listing
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mb-6">
          Update pricing, occupancy availability status, or property specifications.
        </p>
        
        {error && (
          <div className="mb-5 p-3.5 bg-error-container text-on-error-container rounded-xl text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
              Listing Title
            </label>
            <input 
              type="text" 
              name="title" 
              required
              value={formData.title} 
              onChange={handleChange}
              className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Area / Location
              </label>
              <input 
                type="text" 
                name="area" 
                required
                value={formData.area} 
                onChange={handleChange}
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Nearby University / College
              </label>
              <input 
                type="text" 
                name="university_nearby" 
                required
                value={formData.university_nearby} 
                onChange={handleChange}
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* OpenStreetMap Location Picker */}
          <div className="p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 flex flex-col gap-2">
            <div>
              <h2 className="text-xs sm:text-sm font-heading font-bold text-on-surface">
                Hostel Location on OpenStreetMap
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Update the geographical pin location on OpenStreetMap for your property. Students use this for instant walking directions.
              </p>
            </div>
            <GoogleMapLocation
              mode="picker"
              latitude={formData.latitude}
              longitude={formData.longitude}
              title={formData.title || 'Hostel Location'}
              area={formData.area}
              universityId={formData.university_nearby?.toLowerCase()}
              onChangeLocation={(lat, lng) => {
                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
              }}
              height="300px"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Monthly Rent (MWK)
              </label>
              <input 
                type="number" 
                name="rent_mwk" 
                required
                min="0"
                value={formData.rent_mwk} 
                onChange={handleChange}
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Deposit (MWK)
              </label>
              <input 
                type="number" 
                name="deposit_mwk" 
                required
                min="0"
                value={formData.deposit_mwk} 
                onChange={handleChange}
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Room Type
              </label>
              <select 
                name="room_type" 
                value={formData.room_type} 
                onChange={handleChange}
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Single Room">Single Room</option>
                <option value="Self-Contained">Self-Contained</option>
                <option value="Shared Room">Shared Room</option>
                <option value="Cottage">Cottage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Availability Status
              </label>
              <select 
                name="availability_status" 
                value={formData.availability_status} 
                onChange={handleChange}
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable / Occupied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-2">
              Facilities & Amenities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {facilityOptions.map(facility => (
                <label 
                  key={facility} 
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                    Array.isArray(formData.facilities) && formData.facilities.includes(facility)
                      ? 'bg-primary/5 border-primary text-primary'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={Array.isArray(formData.facilities) && formData.facilities.includes(facility)}
                    onChange={() => handleCheckboxChange(facility)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <span>{facility}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
              Description
            </label>
            <textarea 
              name="description" 
              rows="4" 
              required
              value={formData.description} 
              onChange={handleChange}
              className="w-full p-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            ></textarea>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-5 border-t border-outline-variant/20">
            <button 
              type="button" 
              onClick={() => navigate('/landlord/dashboard')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-heading text-xs sm:text-sm font-semibold hover:bg-surface-container text-center active:scale-98 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-on-primary font-heading text-xs sm:text-sm font-bold shadow-sm hover:bg-primary-container disabled:opacity-50 text-center active:scale-98 transition-all"
            >
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
