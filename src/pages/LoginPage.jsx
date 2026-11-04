import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);

  const queryRedirect = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '0991600735',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (formData) => {
    setAuthError(null);
    try {
      await login(formData);
      navigate(queryRedirect, { replace: true });
    } catch (err) {
      setAuthError(
        err.response?.data?.message ||
          'The credentials entered do not match our verified records. Please re-check your student contact details or reset your password.'
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 max-w-md mx-auto w-full">
      {/* Branding & Header */}
      <div className="flex flex-col mb-6">
        <div className="inline-flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
          <span
            className="material-symbols-outlined text-[16px] text-tertiary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            verified_user
          </span>
          <span className="font-heading text-xs font-semibold text-on-surface-variant">
            Verified Campus Accommodation
          </span>
        </div>

        <h1 className="font-heading text-2xl sm:text-3xl text-primary font-extrabold tracking-tight">
          Welcome back
        </h1>
        <p className="font-sans text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
          Log in to view saved rooms, manage campus viewing bookings, or view student notifications.
        </p>
      </div>

      {/* Error Banner matching Stitch reference */}
      {authError && (
        <section
          role="alert"
          aria-live="assertive"
          className="rounded-xl bg-error-container p-4 shadow-sm mb-6 border border-error/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center flex-shrink-0 mt-0.5 text-on-error shadow-sm">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                error
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="font-heading font-bold text-sm text-on-error-container">
                Unable to sign in
              </h2>
              <p className="font-sans text-xs text-on-error-container mt-0.5 leading-normal opacity-95">
                {authError}
              </p>
              <div className="mt-2 pt-2 border-t border-error/15 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-on-error-container">Need swift help?</span>
                <a
                  href="https://wa.me/265991600735"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-secondary hover:opacity-80 inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  <span>WhatsApp Support (+265 991 600 735)</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Identifier Field (Email or Malawi Phone) */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="studentIdentifier"
              className="font-heading text-xs font-bold text-on-surface flex items-center gap-1"
            >
              Email or Malawian Phone
              <span className="text-error font-bold" aria-hidden="true">*</span>
            </label>
            {errors.identifier && (
              <span className="text-[11px] font-bold text-error uppercase">Invalid entry</span>
            )}
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <input
              id="studentIdentifier"
              type="text"
              placeholder="088... or chisomo@unima.ac.mw"
              aria-invalid={Boolean(errors.identifier)}
              className={`
                w-full h-12 pl-11 pr-4 rounded-lg font-sans text-sm sm:text-base transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary
                ${
                  errors.identifier
                    ? 'bg-error-container/30 border border-error text-on-surface focus:ring-error'
                    : 'bg-surface-container-low border border-outline-variant/40 focus:bg-surface-container-lowest'
                }
              `}
              {...register('identifier')}
            />
          </div>

          {errors.identifier && (
            <p className="text-xs font-medium text-error flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              <span>{errors.identifier.message}</span>
            </p>
          )}

          <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">tips_and_updates</span>
            <span>e.g., chisomo@unima.ac.mw or 088 123 4567</span>
          </p>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="passwordField"
              className="font-heading text-xs font-bold text-on-surface flex items-center gap-1"
            >
              Password
              <span className="text-error font-bold" aria-hidden="true">*</span>
            </label>
            <Link
              to="/faq"
              className="font-heading text-xs text-secondary hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center pointer-events-none text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <input
              id="passwordField"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password)}
              className={`
                w-full h-12 pl-11 pr-12 rounded-lg font-sans text-sm sm:text-base transition-colors
                focus:outline-none focus:ring-2 focus:ring-primary
                ${
                  errors.password
                    ? 'bg-error-container/30 border border-error text-on-surface focus:ring-error'
                    : 'bg-surface-container-low border border-outline-variant/40 focus:bg-surface-container-lowest'
                }
              `}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {errors.password && (
            <p className="text-xs font-medium text-error flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              <span>{errors.password.message}</span>
            </p>
          )}
        </div>

        {/* Remember me checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-on-surface-variant py-1">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-primary cursor-pointer"
            {...register('rememberMe')}
          />
          <span>Remember my session on this student device</span>
        </label>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          icon="login"
        >
          Sign In to CampusNest
        </Button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 text-center text-xs text-on-surface-variant flex flex-col gap-2">
        <p>
          New to CampusNest?{' '}
          <Link to="/register" className="font-heading font-bold text-primary hover:underline">
            Create a student account
          </Link>
        </p>
        <p className="text-[11px] text-outline">
          Encrypted 256-bit SSL connection. Never pay upfront before room viewing.
        </p>
      </div>
    </div>
  );
}
