// src/components/landlord/CreateListingForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function CreateListingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    university_nearby: '',
    rent_mwk: '',
    deposit_mwk: '',
    room_type: 'Single Room',
    facilities: []
  });
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const facilityOptions = ['WiFi', 'Water Included', 'Electricity (Prepaid/ESCOM)', 'Security Guard', 'Furnished', 'Kitchen'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (facility) => {
    setFormData(prev => {
      const exists = prev.facilities.includes(facility);
      if (exists) {
        return { ...prev, facilities: prev.facilities.filter(f => f !== facility) };
      } else {
        return { ...prev, facilities: [...prev.facilities, facility] };
      }
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
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
        roomType: formData.room_type?.toLowerCase().includes('double') || formData.room_type?.toLowerCase().includes('shared') ? 'shared' : 'single',
        facilities: formData.facilities.map((f) => ({ id: f.toLowerCase().replace(/\s+/g, '_'), label: f, icon: 'check_circle' })),
        images: imagePreviews.length > 0 ? imagePreviews : ['/hero-room.jpg'],
      };

      await apiClient.post('/accommodations', payload);
      navigate('/landlord/dashboard');
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.response?.data?.message || 'Failed to create listing. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xs p-5 sm:p-8 border border-outline-variant/30">
        <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-on-surface mb-2">
          Create New Accommodation Listing
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mb-6">
          Provide accurate property specifications and pricing details for university students.
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
              placeholder="e.g., Sunrise Cottage near Chancellor College Gate"
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
                placeholder="e.g., Chikanda Village, Zomba"
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
                Nearby University
              </label>
              <input 
                type="text" 
                name="university_nearby" 
                required
                value={formData.university_nearby} 
                onChange={handleChange}
                placeholder="e.g., UNIMA"
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
                placeholder="e.g., 45000"
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
                placeholder="e.g., 45000"
                className="w-full h-11 px-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

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
            <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-2">
              Facilities & Amenities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {facilityOptions.map(facility => (
                <label 
                  key={facility} 
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all ${
                    formData.facilities.includes(facility)
                      ? 'bg-primary/5 border-primary text-primary'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.facilities.includes(facility)}
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
              Description & House Rules
            </label>
            <textarea 
              name="description" 
              rows="4" 
              required
              value={formData.description} 
              onChange={handleChange}
              placeholder="Provide details about water availability, electricity setup (ESCOM prepaid), security, gate hours..."
              className="w-full p-3.5 border border-outline-variant/40 rounded-xl bg-surface-container-low text-on-surface font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-heading font-bold text-on-surface mb-1.5">
              Upload Photos
            </label>
            <div className="border-2 border-dashed border-outline-variant/50 rounded-2xl p-4 sm:p-6 text-center bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-xs sm:text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-on-primary hover:file:bg-primary-container cursor-pointer"
              />
              <p className="text-[11px] text-on-surface-variant mt-2">JPEG, PNG or WebP images supported</p>
            </div>
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3 mt-3">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden border border-outline-variant/30">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
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
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
