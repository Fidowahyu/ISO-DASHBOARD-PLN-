import { useEffect, useState } from 'react';
import {
  getUsers, createUser, updateUser, deactivateUser, activateUser,
  resetUserPassword, getDivisions,
  type UserRecord, type AuthUser,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Role = AuthUser['role'];
const ROLES: Role[] = ['ADMIN', 'PIC', 'REVIEWER', 'MANAGEMENT'];
const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrator',
  PIC: 'PIC',
  REVIEWER: 'Reviewer',
  MANAGEMENT: 'Management',
};
const ROLE_COLORS: Record<Role, string> = {
  ADMIN: '#ef4444',
  PIC: '#6366f1',
  REVIEWER: '#f59e0b',
  MANAGEMENT: '#10b981',
};

interface Division { id: string; code: string; name: string }

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="um-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="um-modal">
        <div className="um-modal__header">
          <h2 className="um-modal__title">{title}</h2>
          <button className="um-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [tempPassword, setTempPassword] = useState<{ user: string; pwd: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create form
  const [form, setForm] = useState({ email: '', fullName: '', role: 'PIC' as Role, divisionId: '' });
  const [formError, setFormError] = useState('');

  async function reload() {
    try {
      const [u, d] = await Promise.all([getUsers(), getDivisions()]);
      setUsers(u);
      setDivisions(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setActionLoading('create');
    try {
      const result = await createUser({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        role: form.role,
        divisionId: form.divisionId || null,
      });
      if (result.temporaryPassword) {
        setTempPassword({ user: result.user.fullName, pwd: result.temporaryPassword });
      }
      setShowCreate(false);
      setForm({ email: '', fullName: '', role: 'PIC', divisionId: '' });
      await reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to create user.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setFormError('');
    setActionLoading('edit');
    try {
      await updateUser(editUser.id, {
        fullName: editUser.fullName,
        role: editUser.role,
        divisionId: editUser.divisionId,
      });
      setEditUser(null);
      await reload();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to update user.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggle(u: UserRecord) {
    setActionLoading(u.id);
    try {
      if (u.isActive) await deactivateUser(u.id);
      else await activateUser(u.id);
      await reload();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleResetPassword(u: UserRecord) {
    if (!window.confirm(`Reset password for ${u.fullName}? A temporary password will be generated.`)) return;
    setActionLoading(u.id + '-reset');
    try {
      const result = await resetUserPassword(u.id);
      setTempPassword({ user: u.fullName, pwd: result.temporaryPassword });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to reset password.');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return (
    <div className="um-loading">
      <div className="um-loading__spinner" />
      <span>Loading users…</span>
    </div>
  );

  return (
    <div className="um-root">
      <style>{UM_STYLES}</style>

      {/* Header */}
      <div className="um-header">
        <div>
          <h1 className="um-title">User Management</h1>
          <p className="um-subtitle">{users.length} total users · {users.filter(u => u.isActive).length} active</p>
        </div>
        <button id="create-user-btn" className="um-btn um-btn--primary" onClick={() => setShowCreate(true)}>
          + Create User
        </button>
      </div>

      {error && <div className="um-alert um-alert--error">{error}</div>}

      {/* Filters */}
      <div className="um-filters">
        <input
          id="user-search"
          type="search"
          placeholder="Search by name or email…"
          className="um-input um-input--search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select id="user-role-filter" className="um-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | '')}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        <select id="user-status-filter" className="um-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Division</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="um-empty">No users found.</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className={!u.isActive ? 'um-row--inactive' : ''}>
                <td>
                  <div className="um-user-cell">
                    <div className="um-avatar" style={{ background: `${ROLE_COLORS[u.role]}22`, color: ROLE_COLORS[u.role] }}>
                      {u.fullName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="um-user-name">{u.fullName}</div>
                      <div className="um-user-email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="um-role-badge" style={{ background: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role], borderColor: `${ROLE_COLORS[u.role]}30` }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="um-cell--muted">{u.division?.name ?? <span className="um-na">—</span>}</td>
                <td>
                  <span className={`um-status-badge ${u.isActive ? 'um-status-badge--active' : 'um-status-badge--inactive'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="um-cell--muted">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="um-na">Never</span>}
                </td>
                <td>
                  <div className="um-actions">
                    <button
                      className="um-action-btn"
                      onClick={() => { setEditUser(u); setFormError(''); }}
                      title="Edit user"
                      disabled={actionLoading === u.id}
                    >
                      Edit
                    </button>
                    <button
                      className="um-action-btn um-action-btn--warn"
                      onClick={() => handleResetPassword(u)}
                      title="Reset password"
                      disabled={actionLoading === u.id + '-reset'}
                    >
                      {actionLoading === u.id + '-reset' ? '…' : 'Reset Pwd'}
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        className={`um-action-btn ${u.isActive ? 'um-action-btn--danger' : 'um-action-btn--success'}`}
                        onClick={() => handleToggle(u)}
                        disabled={actionLoading === u.id}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {actionLoading === u.id ? '…' : (u.isActive ? 'Deactivate' : 'Activate')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create New User" onClose={() => { setShowCreate(false); setFormError(''); }}>
          <form onSubmit={handleCreate} className="um-form">
            {formError && <div className="um-alert um-alert--error">{formError}</div>}
            <div className="um-field">
              <label htmlFor="create-email">Email</label>
              <input id="create-email" type="email" required className="um-input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@organization.com" />
            </div>
            <div className="um-field">
              <label htmlFor="create-fullname">Full Name</label>
              <input id="create-fullname" type="text" required className="um-input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="John Doe" />
            </div>
            <div className="um-field">
              <label htmlFor="create-role">Role</label>
              <select id="create-role" className="um-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="um-field">
              <label htmlFor="create-division">Division (optional)</label>
              <select id="create-division" className="um-select" value={form.divisionId} onChange={e => setForm(f => ({ ...f, divisionId: e.target.value }))}>
                <option value="">— No Division —</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.code} – {d.name}</option>)}
              </select>
            </div>
            <p className="um-hint">A temporary password will be generated and shown after creation.</p>
            <div className="um-form-actions">
              <button type="button" className="um-btn um-btn--ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" id="create-user-submit" className="um-btn um-btn--primary" disabled={actionLoading === 'create'}>
                {actionLoading === 'create' ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editUser && (
        <Modal title="Edit User" onClose={() => { setEditUser(null); setFormError(''); }}>
          <form onSubmit={handleUpdate} className="um-form">
            {formError && <div className="um-alert um-alert--error">{formError}</div>}
            <div className="um-field">
              <label>Email</label>
              <input type="email" className="um-input" value={editUser.email} disabled />
            </div>
            <div className="um-field">
              <label htmlFor="edit-fullname">Full Name</label>
              <input id="edit-fullname" type="text" required className="um-input" value={editUser.fullName} onChange={e => setEditUser(u => u && ({ ...u, fullName: e.target.value }))} />
            </div>
            <div className="um-field">
              <label htmlFor="edit-role">Role</label>
              <select
                id="edit-role"
                className="um-select"
                value={editUser.role}
                onChange={e => setEditUser(u => u && ({ ...u, role: e.target.value as Role }))}
                disabled={editUser.id === currentUser?.id}
              >
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              {editUser.id === currentUser?.id && <p className="um-hint">You cannot change your own role.</p>}
            </div>
            <div className="um-field">
              <label htmlFor="edit-division">Division</label>
              <select id="edit-division" className="um-select" value={editUser.divisionId ?? ''} onChange={e => setEditUser(u => u && ({ ...u, divisionId: e.target.value || null }))}>
                <option value="">— No Division —</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.code} – {d.name}</option>)}
              </select>
            </div>
            <div className="um-form-actions">
              <button type="button" className="um-btn um-btn--ghost" onClick={() => setEditUser(null)}>Cancel</button>
              <button type="submit" id="edit-user-submit" className="um-btn um-btn--primary" disabled={actionLoading === 'edit'}>
                {actionLoading === 'edit' ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Temp Password Modal */}
      {tempPassword && (
        <Modal title="Temporary Password" onClose={() => setTempPassword(null)}>
          <div className="um-temp-pwd">
            <p>Share this temporary password with <strong>{tempPassword.user}</strong> securely (e.g. via encrypted message). The user should change it immediately after first login.</p>
            <div className="um-pwd-box">
              <code id="temp-password-value">{tempPassword.pwd}</code>
              <button className="um-copy-btn" onClick={() => navigator.clipboard.writeText(tempPassword.pwd)}>Copy</button>
            </div>
            <div className="um-form-actions">
              <button id="temp-pwd-close" className="um-btn um-btn--primary" onClick={() => setTempPassword(null)}>Done</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const UM_STYLES = `
.um-root { display: flex; flex-direction: column; gap: 20px; }
.um-loading { display: flex; align-items: center; gap: 12px; color: #64748b; padding: 40px; }
.um-loading__spinner { width: 24px; height: 24px; border: 2px solid rgba(99,102,241,0.2); border-top-color: #6366f1; border-radius: 50%; animation: um-spin 0.8s linear infinite; }
@keyframes um-spin { to { transform: rotate(360deg); } }

.um-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.um-title { font-size: 1.25rem; font-weight: 700; color: var(--foreground); margin: 0 0 4px; }
.um-subtitle { font-size: 0.8rem; color: var(--muted-foreground); margin: 0; }

.um-alert { padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; }
.um-alert--error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5; }

.um-filters { display: flex; gap: 10px; flex-wrap: wrap; }
.um-input { padding: 8px 12px; background: var(--background); border: 1px solid var(--border); border-radius: 8px; color: var(--foreground); font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
.um-input:focus { border-color: rgba(99,102,241,0.5); }
.um-input--search { flex: 1; min-width: 200px; }
.um-select { padding: 8px 12px; background: var(--background); border: 1px solid var(--border); border-radius: 8px; color: var(--foreground); font-size: 0.875rem; outline: none; cursor: pointer; }

.um-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: 12px; }
.um-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.um-table thead { background: var(--card); }
.um-table th { padding: 10px 16px; text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
.um-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
.um-table tr:last-child td { border-bottom: none; }
.um-table tr:hover td { background: var(--accent); }
.um-row--inactive td { opacity: 0.55; }
.um-empty { text-align: center; color: var(--muted-foreground); padding: 32px; }
.um-cell--muted { color: var(--muted-foreground); font-size: 0.8rem; }
.um-na { color: var(--muted-foreground); opacity: 0.5; }

.um-user-cell { display: flex; align-items: center; gap: 10px; }
.um-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
.um-user-name { font-weight: 600; color: var(--foreground); line-height: 1.2; }
.um-user-email { font-size: 0.75rem; color: var(--muted-foreground); }

.um-role-badge { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; border: 1px solid; }
.um-status-badge { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; }
.um-status-badge--active { background: rgba(16,185,129,0.1); color: #10b981; }
.um-status-badge--inactive { background: rgba(100,116,139,0.1); color: #64748b; }

.um-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.um-action-btn { padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: 1px solid; transition: opacity 0.15s; background: transparent; }
.um-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.um-action-btn { border-color: var(--border); color: var(--foreground); }
.um-action-btn:hover:not(:disabled) { background: var(--accent); }
.um-action-btn--warn { border-color: rgba(245,158,11,0.3); color: #f59e0b; }
.um-action-btn--warn:hover:not(:disabled) { background: rgba(245,158,11,0.08); }
.um-action-btn--danger { border-color: rgba(239,68,68,0.3); color: #ef4444; }
.um-action-btn--danger:hover:not(:disabled) { background: rgba(239,68,68,0.08); }
.um-action-btn--success { border-color: rgba(16,185,129,0.3); color: #10b981; }
.um-action-btn--success:hover:not(:disabled) { background: rgba(16,185,129,0.08); }

.um-btn { padding: 8px 18px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.15s, transform 0.1s; }
.um-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.um-btn--primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
.um-btn--primary:hover:not(:disabled) { opacity: 0.9; }
.um-btn--ghost { background: var(--accent); color: var(--foreground); }

.um-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); animation: um-fadeIn 0.15s ease; }
@keyframes um-fadeIn { from { opacity: 0; } to { opacity: 1; } }
.um-modal { background: var(--card); border: 1px solid var(--border); border-radius: 16px; width: 100%; max-width: 480px; box-shadow: 0 24px 48px rgba(0,0,0,0.5); animation: um-slideIn 0.2s ease; }
@keyframes um-slideIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.um-modal__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
.um-modal__title { font-size: 1rem; font-weight: 700; color: var(--foreground); margin: 0; }
.um-modal__close { background: none; border: none; cursor: pointer; color: var(--muted-foreground); font-size: 1rem; padding: 4px; border-radius: 4px; transition: color 0.15s; }
.um-modal__close:hover { color: var(--foreground); }

.um-form { display: flex; flex-direction: column; gap: 14px; padding: 24px; }
.um-field { display: flex; flex-direction: column; gap: 5px; }
.um-field label { font-size: 0.8rem; font-weight: 600; color: var(--muted-foreground); }
.um-field .um-input, .um-field .um-select { width: 100%; box-sizing: border-box; }
.um-hint { font-size: 0.75rem; color: var(--muted-foreground); margin: 0; }
.um-form-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }

.um-temp-pwd { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.um-temp-pwd p { font-size: 0.875rem; color: var(--muted-foreground); line-height: 1.6; margin: 0; }
.um-pwd-box { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; }
.um-pwd-box code { flex: 1; font-size: 1rem; font-family: monospace; color: #a5b4fc; letter-spacing: 0.05em; }
.um-copy-btn { padding: 4px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; }
`;
