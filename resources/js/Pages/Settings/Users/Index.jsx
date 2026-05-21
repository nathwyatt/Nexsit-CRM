import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', agent: 'Agent' };
const ROLE_COLORS = {
    admin:   'bg-purple-50 text-purple-700',
    manager: 'bg-blue-50 text-blue-700',
    agent:   'bg-gray-100 text-gray-600',
};

function InviteForm({ onDone }) {
    const [form, setForm] = useState({ name: '', email: '', role: 'agent', phone: '' });
    const [errors, setErrors] = useState({});

    function handleSubmit(e) {
        e.preventDefault();
        router.post('/settings/users', form, {
            onSuccess: () => { onDone(); setForm({ name: '', email: '', role: 'agent', phone: '' }); },
            onError: (errs) => setErrors(errs),
        });
    }

    const inp = 'border border-gray-300 rounded-md px-2.5 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <form onSubmit={handleSubmit} className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-indigo-900">Invite New Team Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Jane Doe" className={inp} />
                    {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="jane@example.com" className={inp} />
                    {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
                    <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inp}>
                        <option value="agent">Agent</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+250 78 000 0000" className={inp} />
                </div>
            </div>
            <div className="flex gap-3">
                <button type="submit"
                    className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                    Send Invite
                </button>
                <button type="button" onClick={onDone}
                    className="px-4 py-1.5 bg-white text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                    Cancel
                </button>
            </div>
            <p className="text-xs text-indigo-600">A temporary password will be shown after creation.</p>
        </form>
    );
}

function EditModal({ user, onClose }) {
    const [form, setForm] = useState({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone ?? '',
    });
    const [errors, setErrors] = useState({});

    function handleSubmit(e) {
        e.preventDefault();
        router.patch(`/settings/users/${user.id}`, form, {
            onSuccess: onClose,
            onError: (errs) => setErrors(errs),
        });
    }

    const inp = 'border border-gray-300 rounded-md px-2.5 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Edit {user.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} />
                        {errors.name && <p className="text-red-500 text-xs mt-0.5">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} />
                        {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
                        <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inp}>
                            <option value="agent">Agent</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="+250 78 000 0000" className={inp} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit"
                            className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                            Save Changes
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-4 py-1.5 bg-white text-gray-600 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function UsersIndex({ users }) {
    const [showInvite, setShowInvite] = useState(false);
    const [editing, setEditing]       = useState(null);

    function handleToggle(user) {
        const action = user.is_active ? 'deactivate' : 'activate';
        if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} ${user.name}?`)) return;
        router.patch(`/settings/users/${user.id}/toggle`);
    }

    function handleResetPassword(user) {
        if (!confirm(`Reset password for ${user.name}? A new temporary password will be shown.`)) return;
        router.patch(`/settings/users/${user.id}/reset-password`);
    }

    const activeCount   = users.filter(u => u.is_active).length;
    const adminCount    = users.filter(u => u.role === 'admin').length;
    const managerCount  = users.filter(u => u.role === 'manager').length;

    return (
        <AppLayout title="Team Members">
            <div className="max-w-5xl space-y-5">
                {editing && (
                    <EditModal user={editing} onClose={() => setEditing(null)} />
                )}

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Team Members</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {activeCount} active · {adminCount} admin · {managerCount} manager · {users.length - adminCount - managerCount} agents
                        </p>
                    </div>
                    {!showInvite && (
                        <button onClick={() => setShowInvite(true)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                            + Invite Member
                        </button>
                    )}
                </div>

                {showInvite && (
                    <InviteForm onDone={() => setShowInvite(false)} />
                )}

                {/* User table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Last Login</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map(user => (
                                <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.is_active ? 'opacity-60' : ''}`}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name}
                                                    className="w-8 h-8 rounded-full object-cover shrink-0" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {user.name}
                                                    {user.is_self && <span className="ml-1.5 text-xs text-indigo-500 font-normal">(you)</span>}
                                                </p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                                {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                                            {ROLE_LABELS[user.role]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400">
                                        {user.last_login_at ?? 'Never'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            user.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <button onClick={() => setEditing(user)}
                                                className="text-xs px-2.5 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                                                Edit
                                            </button>
                                            {!user.is_self && (
                                                <>
                                                    <button onClick={() => handleToggle(user)}
                                                        className={`text-xs px-2.5 py-1 rounded border font-medium ${
                                                            user.is_active
                                                                ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                                                : 'border-green-200 text-green-600 hover:bg-green-50'
                                                        }`}>
                                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button onClick={() => handleResetPassword(user)}
                                                        className="text-xs px-2.5 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50">
                                                        Reset Pwd
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="text-center py-12 text-gray-300">
                            <p className="text-3xl mb-2">👥</p>
                            <p className="text-sm">No team members yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
