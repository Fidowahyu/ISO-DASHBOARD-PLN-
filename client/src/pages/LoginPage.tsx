import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'PIC' | 'REVIEWER' | 'MANAGEMENT' | 'ADMIN'>('PIC');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        if (regPassword !== regConfirmPassword) {
          setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
          setSubmitting(false);
          return;
        }
        if (regPassword.length < 6) {
          setError('Password minimal harus 6 karakter.');
          setSubmitting(false);
          return;
        }
        await register({
          fullName: regFullName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
        });
      }
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operasi gagal. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="login-loading">
        <div className="login-loading__spinner" />
      </div>
    );
  }

  return (
    <div className="login-root">
      {/* Background */}
      <div className="login-bg" aria-hidden="true">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
      </div>

      <main className="login-main">
        {/* Logo / Branding */}
        <div className="login-brand">
          <div className="login-brand__icon">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="url(#brandGrad)" />
              <path d="M8 10h16M8 16h10M8 22h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="login-brand__title">ISO 30414</h1>
            <p className="login-brand__subtitle">Human Capital Reporting Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="login-card">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-white/10 mb-6 p-1 bg-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Masuk Akun (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daftar Baru (Register)
            </button>
          </div>

          <div className="login-card__header">
            <h2 className="login-card__heading">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
            </h2>
            <p className="login-card__desc">
              {mode === 'login'
                ? 'Masukkan email dan password untuk mengakses platform ISO 30414'
                : 'Lengkapi formulir di bawah untuk mendaftarkan akun pengguna baru'}
            </p>
          </div>

          <form id="login-form" className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Error Alert */}
            {error && (
              <div className="login-alert" role="alert" aria-live="assertive">
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                <span>{error}</span>
              </div>
            )}

            {mode === 'login' ? (
              <>
                {/* Email */}
                <div className="login-field">
                  <label htmlFor="login-email" className="login-field__label">
                    Alamat Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    className="login-field__input"
                    placeholder="name@organization.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Password */}
                <div className="login-field">
                  <label htmlFor="login-password" className="login-field__label">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    className="login-field__input"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Full Name */}
                <div className="login-field">
                  <label htmlFor="reg-fullname" className="login-field__label">
                    Nama Lengkap
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    className="login-field__input"
                    placeholder="Contoh: Fido Wahyu Pradana"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Email */}
                <div className="login-field">
                  <label htmlFor="reg-email" className="login-field__label">
                    Alamat Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    className="login-field__input"
                    placeholder="fidowahyu@pln.co.id"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Role Select */}
                <div className="login-field">
                  <label htmlFor="reg-role" className="login-field__label">
                    Peran / Hak Akses Sistem
                  </label>
                  <select
                    id="reg-role"
                    className="login-field__input bg-slate-900 text-white border-slate-700"
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as typeof regRole)}
                    disabled={submitting}
                  >
                    <option value="PIC">PIC / Contributor Metrik</option>
                    <option value="REVIEWER">Reviewer / Validator Data</option>
                    <option value="MANAGEMENT">Executive Management</option>
                    <option value="ADMIN">System Administrator</option>
                  </select>
                </div>

                {/* Password */}
                <div className="login-field">
                  <label htmlFor="reg-password" className="login-field__label">
                    Password Baru
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    className="login-field__input"
                    placeholder="Minimal 6 karakter"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {/* Confirm Password */}
                <div className="login-field">
                  <label htmlFor="reg-confirm" className="login-field__label">
                    Konfirmasi Password
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    className="login-field__input"
                    placeholder="Ulangi password baru"
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="login-btn"
              disabled={submitting || (mode === 'login' ? (!email || !password) : (!regFullName || !regEmail || !regPassword || !regConfirmPassword))}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className="login-btn__spinner" aria-hidden="true" />
                  {mode === 'login' ? 'Memproses Masuk…' : 'Mendaftarkan Akun…'}
                </>
              ) : (
                mode === 'login' ? 'Masuk ke Platform' : 'Daftar Akun Baru'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {mode === 'login'
                ? 'Belum memiliki akun? Klik tab "Daftar Baru" di atas.'
                : 'Sudah memiliki akun? Klik tab "Masuk Akun" di atas.'}
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <p className="login-note">
          ISO 30414:2018 · Human Capital Reporting · Enterprise Advisory System
        </p>
      </main>

      <style>{`
        /* ─── Login Page Styles ─── */
        .login-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #0f0f14;
        }
        .login-loading__spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(99,102,241,0.2);
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .login-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f14;
          padding: 24px;
          overflow: hidden;
        }

        /* Orbs */
        .login-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .login-bg__orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
        }
        .login-bg__orb--1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #6366f1, transparent);
          top: -120px; left: -120px;
          animation: orbFloat 10s ease-in-out infinite;
        }
        .login-bg__orb--2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #8b5cf6, transparent);
          bottom: -80px; right: -80px;
          animation: orbFloat 13s ease-in-out infinite reverse;
        }
        .login-bg__orb--3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #06b6d4, transparent);
          top: 60%; left: 60%;
          animation: orbFloat 8s ease-in-out infinite 2s;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }

        /* Main */
        .login-main {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          align-items: center;
        }

        /* Brand */
        .login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .login-brand__icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          filter: drop-shadow(0 4px 16px rgba(99,102,241,0.5));
        }
        .login-brand__title {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #e0e7ff, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.03em;
        }
        .login-brand__subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Card */
        .login-card {
          width: 100%;
          background: rgba(17,17,27,0.9);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 20px;
          padding: 36px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(99,102,241,0.08),
            0 24px 48px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.05);
          animation: cardIn 0.4s ease both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-card__header {
          margin-bottom: 28px;
          text-align: center;
        }
        .login-card__heading {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.3rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }
        .login-card__desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.875rem;
          color: #64748b;
          margin: 0;
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* Alert */
        .login-alert {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          color: #fca5a5;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.875rem;
          animation: shake 0.35s ease;
        }
        .login-alert svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 1px;
          color: #ef4444;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Field */
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .login-field__label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.03em;
        }
        .login-field__input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #f1f5f9;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
          box-sizing: border-box;
        }
        .login-field__input::placeholder {
          color: #475569;
        }
        .login-field__input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
          background: rgba(99,102,241,0.04);
        }
        .login-field__input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Submit Button */
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 13px 24px;
          margin-top: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 10px;
          color: white;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.45);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .login-btn__spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .login-footer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          text-align: center;
        }
        .login-footer p {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.8rem;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }

        /* Note */
        .login-note {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.75rem;
          color: #334155;
          text-align: center;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
