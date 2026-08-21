import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Mail, Lock, User, Building } from 'lucide-react';

export function LoginPage() {
  const { login, register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('admin@pln.co.id');
  const [password, setPassword] = useState('Admin123!');

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
      setError(err instanceof Error ? err.message : 'Operasi gagal. Silakan periksa kredensial Anda.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickLogin(quickEmail: string, quickPass: string) {
    setError('');
    setSubmitting(true);
    try {
      await login(quickEmail, quickPass);
      const redirect = searchParams.get('redirect') ?? '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login demo gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span>Memverifikasi sesi pengguna...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-950 p-4 font-sans text-slate-100 overflow-hidden">
      {/* Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />

      <main className="relative z-10 flex w-full max-w-md flex-col gap-6">
        {/* Branding Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white">ISO 30414 Platform</h1>
          <p className="text-xs text-slate-400">Standardized Human Capital Reporting System</p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
          {/* Mode Switcher Tabs */}
          <div className="mb-6 flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Masuk Akun (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Daftar Baru (Register)
            </button>
          </div>

          <div className="mb-5 text-center">
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Masuk ke Akun Anda' : 'Pendaftaran Akun Baru'}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {mode === 'login'
                ? 'Gunakan akun terdaftar atau demo 1-click di bawah'
                : 'Lengkapi data diri dan peran sistem pengguna baru'}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-xs font-medium text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'login' ? (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="admin@pln.co.id"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Nama Lengkap Karyawan"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Alamat Email Perusahaan
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="user@pln.co.id"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Peran / Role Hak Akses
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <select
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3.5 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Ulangi password baru"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Memproses...</span>
                </div>
              ) : (
                mode === 'login' ? 'Masuk ke Platform' : 'Daftar Akun Baru'
              )}
            </button>
          </form>

          {/* Quick Demo Login Buttons */}
          {mode === 'login' && (
            <div className="mt-6 border-t border-slate-800/80 pt-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                ⚡ Demologin 1-Click Berdasarkan Role:
              </span>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@pln.co.id', 'Admin123!')}
                  className="flex items-center justify-between rounded-lg border border-indigo-500/40 bg-indigo-950/30 p-2.5 text-left text-xs font-bold text-indigo-300 hover:bg-indigo-900/40 transition-colors cursor-pointer"
                >
                  <span>Admin System</span>
                  <Badge variant="outline" className="border-indigo-400/30 bg-indigo-400/10 text-[10px]">ADMIN</Badge>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('pic.hsc@pln.co.id', 'Pic123!')}
                  className="flex items-center justify-between rounded-lg border border-blue-500/40 bg-blue-950/30 p-2.5 text-left text-xs font-bold text-blue-300 hover:bg-blue-900/40 transition-colors cursor-pointer"
                >
                  <span>PIC Input Data</span>
                  <Badge variant="outline" className="border-blue-400/30 bg-blue-400/10 text-[10px]">PIC</Badge>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('reviewer@pln.co.id', 'Reviewer123!')}
                  className="flex items-center justify-between rounded-lg border border-purple-500/40 bg-purple-950/30 p-2.5 text-left text-xs font-bold text-purple-300 hover:bg-purple-900/40 transition-colors cursor-pointer"
                >
                  <span>Reviewer / Auditor</span>
                  <Badge variant="outline" className="border-purple-400/30 bg-purple-400/10 text-[10px]">REVIEW</Badge>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('management@pln.co.id', 'Mgmt123!')}
                  className="flex items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-2.5 text-left text-xs font-bold text-emerald-300 hover:bg-emerald-900/40 transition-colors cursor-pointer"
                >
                  <span>Executive Mgmt</span>
                  <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 text-[10px]">MGMT</Badge>
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-500">
          ISO 30414:2018 · Standardized Human Capital Reporting Platform
        </p>
      </main>
    </div>
  );
}
