import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const [role, setRole] = useState('student'); // 'student' | 'landlord'
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
      fullName: '',
      email: '',
      phone: '',
      university: 'unima',
      yearOfStudy: '1st Year',
      propertyArea: 'Zomba (near UNIMA / Chancellor College)',
      password: '',
      confirmPassword: '',
      agreeTerms: true,
    },
  });

  const handleRoleToggle = (selectedRole) => {
    setRole(selectedRole);
    setValue('role', selectedRole, { shouldValidate: true });
    clearErrors();
  };

  const onSubmit = async (formData) => {
    setFormError(null);
    try {
      const payload = { ...formData, role };
      await registerUser(payload);
      if (role === 'landlord') {
        navigate('/landlord/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to complete registration. Please try again.');
    }
  };

  const isStudent = role === 'student';

  return (
    <div className="flex-1 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 max-w-lg mx-auto w-full">
      {/* Header Info */}
      <div className="flex flex-col mb-5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full w-fit mb-3 shadow-xs ${
          isStudent ? 'bg-surface-container text-on-surface-variant' : 'bg-secondary/10 text-secondary'
        }`}>
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isStudent ? 'school' : 'real_estate_agent'}
          </span>
          <span className="font-heading text-xs font-semibold">
            {isStudent ? 'Verified Student Registration' : 'Property Host & Landlord Registration'}
          </span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl text-primary font-extrabold tracking-tight">
          {isStudent ? 'Create Student Account' : 'Create Landlord Account'}
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
          {isStudent
            ? 'Join thousands of university scholars finding safe, verified hostels in Malawi.'
            : 'List your student hostels, manage physical walkthrough bookings, and connect with university scholars.'}
        </p>
      </div>

      {/* Role Toggle: Student vs Landlord */}
      <div className="flex flex-col gap-1.5 mb-6">
        <label className="font-heading text-xs font-bold text-on-surface flex items-center justify-between">
          <span>I am registering as:</span>
          <span className="text-[11px] text-primary font-semibold">
            {isStudent ? 'Looking for student housing' : 'Listing accommodations'}
          </span>
        </label>
        <div className="grid grid-cols-2 p-1.5 bg-surface-container rounded-2xl border border-outline-variant/30 gap-1.5">
          <button
            type="button"
            onClick={() => handleRoleToggle('student')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-heading text-xs sm:text-sm font-bold transition-all active:scale-98 ${
              isStudent
                ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-primary/20'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px] text-primary"
              style={{ fontVariationSettings: isStudent ? "'FILL' 1" : "'FILL' 0" }}
            >
              school
            </span>
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleToggle('landlord')}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-heading text-xs sm:text-sm font-bold transition-all active:scale-98 ${
              !isStudent
                ? 'bg-surface-container-lowest text-secondary shadow-xs ring-1 ring-secondary/20'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px] text-secondary"
              style={{ fontVariationSettings: !isStudent ? "'FILL' 1" : "'FILL' 0" }}
            >
              real_estate_agent
            </span>
            <span>Landlord / Host</span>
          </button>
        </div>
      </div>

      {formError && (
        <div className="rounded-xl bg-error-container p-4 text-xs text-on-error-container mb-6 border border-error/20 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Full Name */}
        <Input
          label={isStudent ? 'Full Legal Name' : 'Full Name or Property Business Name'}
          placeholder={isStudent ? 'e.g. Chisomo Banda' : 'e.g. Mr. B. Phiri / Sunrise Accommodations'}
          icon="person"
          required
          {...register('fullName')}
          error={errors.fullName?.message}
        />

        {/* Email */}
        <Input
          label={isStudent ? 'College or Personal Email' : 'Contact Email Address'}
          type="email"
          placeholder={isStudent ? 'e.g. chisomo.banda@unima.ac.mw' : 'e.g. landlord@example.com'}
          icon="mail"
          required
          hint={isStudent ? 'University domain emails receive instant verified status' : 'Used for booking notifications and tenant inquiries'}
          {...register('email')}
          error={errors.email?.message}
        />

        {/* Malawian Phone */}
        <Input
          label="Malawian Mobile Number"
          type="tel"
          placeholder="0888 123 456 or 0999 123 456"
          icon="phone_iphone"
          required
          hint={isStudent ? 'Used for viewing notifications and direct landlord contact' : 'Used for WhatsApp/SMS viewing inquiries from students'}
          {...register('phone')}
          error={errors.phone?.message}
        />

        {/* Dynamic Fields: Student (Uni + Year) vs Landlord (Property Vicinity) */}
        {isStudent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="uni-select" className="font-heading text-xs font-bold text-on-surface">
                University Affiliation <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  id="uni-select"
                  className="w-full h-12 pl-3 pr-8 rounded-lg bg-surface-container-low text-xs sm:text-sm text-on-surface border border-outline-variant/40 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('university')}
                >
                  <option value="unima">UNIMA (Chancellor College)</option>
                  <option value="must">MUST (Thyolo)</option>
                  <option value="kuhes">KUHeS (Blantyre)</option>
                  <option value="mubas">MUBAS (Blantyre)</option>
                  <option value="luanar">LUANAR (Bunda / NRC)</option>
                  <option value="mzuni">MZUNI (Mzuzu)</option>
                  <option value="dmi">DMI (DMI Mangochi Campus)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
              {errors.university && (
                <span className="text-xs text-error">{errors.university.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="year-select" className="font-heading text-xs font-bold text-on-surface">
                Current Year of Study
              </label>
              <div className="relative">
                <select
                  id="year-select"
                  className="w-full h-12 pl-3 pr-8 rounded-lg bg-surface-container-low text-xs sm:text-sm text-on-surface border border-outline-variant/40 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('yearOfStudy')}
                >
                  <option value="1st Year">1st Year Undergraduate</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year Finalist</option>
                  <option value="Postgraduate">Postgraduate / Masters</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="area-select" className="font-heading text-xs font-bold text-on-surface">
              Primary Campus Vicinity of Your Properties <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                id="area-select"
                className="w-full h-12 pl-3 pr-8 rounded-lg bg-surface-container-low text-xs sm:text-sm text-on-surface border border-outline-variant/40 appearance-none focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('propertyArea')}
              >
                <option value="Zomba (near UNIMA / Chancellor College)">Zomba (near UNIMA / Chancellor College)</option>
                <option value="Thyolo (near MUST)">Thyolo (near MUST)</option>
                <option value="Blantyre (near KUHeS / MUBAS)">Blantyre (near KUHeS / MUBAS)</option>
                <option value="Lilongwe (near LUANAR Bunda / NRC)">Lilongwe (near LUANAR Bunda / NRC)</option>
                <option value="Mzuzu (near MZUNI)">Mzuzu (near MZUNI)</option>
                <option value="Mangochi (near DMI)">Mangochi (near DMI)</option>
                <option value="Other campus area">Other Malawian campus area</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-on-surface-variant text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        )}

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-pass" className="font-heading text-xs font-bold text-on-surface">
            Password (at least 8 characters with letters & numbers) <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
              lock
            </span>
            <input
              id="reg-pass"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full h-12 pl-10 pr-12 rounded-lg bg-surface-container-low text-xs sm:text-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              className="absolute right-2 text-on-surface-variant p-2"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-error">{errors.password.message}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-confirm" className="font-heading text-xs font-bold text-on-surface">
            Confirm Password <span className="text-error">*</span>
          </label>
          <input
            id="reg-confirm"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full h-12 px-3.5 rounded-lg bg-surface-container-low text-xs sm:text-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-error">{errors.confirmPassword.message}</span>
          )}
        </div>

        {/* Safety Agreement */}
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-on-surface-variant py-1">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-primary mt-0.5 cursor-pointer"
            {...register('agreeTerms')}
          />
          <span>
            I acknowledge CampusNest's Zero Advance Fee policy and agree to the{' '}
            <Link to="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link to="/safety" className="text-primary font-bold hover:underline">Safety Guidelines</Link>.
          </span>
        </label>
        {errors.agreeTerms && (
          <span className="text-xs text-error">{errors.agreeTerms.message}</span>
        )}

        <Button
          type="submit"
          variant={isStudent ? 'primary' : 'accent'}
          size="lg"
          fullWidth
          loading={isSubmitting}
          icon={isStudent ? 'how_to_reg' : 'real_estate_agent'}
        >
          {isStudent ? 'Create Free Student Account' : 'Create Landlord Account'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-on-surface-variant">
        Already registered?{' '}
        <Link to="/login" className="font-heading font-bold text-primary hover:underline">
          Sign In here
        </Link>
      </div>
    </div>
  );
}
