import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import RegisterPage from '../pages/RegisterPage';
import { AuthProvider } from '../context/AuthContext';

function renderRegisterPage() {
  return render(
    <AuthProvider>
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    </AuthProvider>
  );
}

describe('RegisterPage Role Toggle', () => {
  it('defaults to student registration mode with student fields', () => {
    renderRegisterPage();

    expect(screen.getByRole('heading', { name: /Create Student Account/i })).toBeInTheDocument();
    expect(screen.getByText(/University Affiliation/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Free Student Account/i })).toBeInTheDocument();
  });

  it('switches to landlord registration mode when clicking Landlord toggle', () => {
    renderRegisterPage();

    const landlordBtn = screen.getByRole('button', { name: /Landlord \/ Host/i });
    fireEvent.click(landlordBtn);

    expect(screen.getByRole('heading', { name: /Create Landlord Account/i })).toBeInTheDocument();
    expect(screen.getByText(/Primary Campus Vicinity of Your Properties/i)).toBeInTheDocument();
    expect(screen.queryByText(/University Affiliation/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Landlord Account/i })).toBeInTheDocument();
  });

  it('can toggle back to student mode seamlessly', () => {
    renderRegisterPage();

    const landlordBtn = screen.getByRole('button', { name: /Landlord \/ Host/i });
    fireEvent.click(landlordBtn);
    expect(screen.getByRole('heading', { name: /Create Landlord Account/i })).toBeInTheDocument();

    const studentBtn = screen.getByRole('button', { name: /Student/i });
    fireEvent.click(studentBtn);
    expect(screen.getByRole('heading', { name: /Create Student Account/i })).toBeInTheDocument();
    expect(screen.getByText(/University Affiliation/i)).toBeInTheDocument();
  });
});
