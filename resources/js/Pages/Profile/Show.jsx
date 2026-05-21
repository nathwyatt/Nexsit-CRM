import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', agent: 'Agent' };

function Section({ title, description, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="mb-5">
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
            </div>
            {children}
        </div>
    );
}

export default function ProfileShow({ user }) {
    const [profile, setProfile]  = useState({ name: user.name, email: user.email, phone: user.phone ?? '' });
    const [passwords, setPwd]    = useState({ current_password: '', password: '', password_confirmation: '' });
    const [profileErrors, setPE] = useState({});
    const [pwdErrors, setPE2]    = useState({});

    const inp = 'border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500';

    function submitProfile(e) {
        e.preventDefault();
        router.patch('/profile', profile, {
            onSuccess: () => setPE({}),
            onError: (errs) => setPE(errs),
        });
    }

    function submitPassword(e) {
        e.preventDefault();
        router.patch('/profile/password', passwords, {
            onSuccess: () => {
                setPE2({});
                setPwd({ current_password: '', password: '', password_confirmation: '' });
            },
            onError: (errs) => setPE2(errs),
        });
    }

    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <AppLayout title="My Profile">
            <div className="max-w-2xl space-y-5">
                {/* Avatar + name header */}
                <div className="flex items-center gap-4">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.name}
                            className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                            {initials}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                            {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                    </div>
                </div>

                {/* Profile details */}
                <Section title="Personal Information" description="Update your name, email, and phone number.">
                    <form onSubmit={submitProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                            <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                className={inp} />
                            {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email Address *</label>
                            <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                className={inp} />
                            {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                            <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                                placeholder="+250 78 000 0000" className={inp} />
                        </div>
                        <div className="pt-1">
                            <button type="submit"
                                className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                                Save Profile
                            </button>
                        </div>
                    </form>
                </Section>

                {/* Change password */}
                <Section title="Change Password" description="Use a strong password with at least 8 characters.">
                    <form onSubmit={submitPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password *</label>
                            <input type="password" value={passwords.current_password}
                                onChange={e => setPwd(p => ({ ...p, current_password: e.target.value }))}
                                className={inp} autoComplete="current-password" />
                            {pwdErrors.current_password && (
                                <p className="text-red-500 text-xs mt-1">{pwdErrors.current_password}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">New Password *</label>
                            <input type="password" value={passwords.password}
                                onChange={e => setPwd(p => ({ ...p, password: e.target.value }))}
                                className={inp} autoComplete="new-password" />
                            {pwdErrors.password && <p className="text-red-500 text-xs mt-1">{pwdErrors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password *</label>
                            <input type="password" value={passwords.password_confirmation}
                                onChange={e => setPwd(p => ({ ...p, password_confirmation: e.target.value }))}
                                className={inp} autoComplete="new-password" />
                        </div>
                        <div className="pt-1">
                            <button type="submit"
                                className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                                Update Password
                            </button>
                        </div>
                    </form>
                </Section>

                {/* Account info */}
                <Section title="Account" description="Your role and access level are managed by an admin.">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-gray-400">Role</p>
                            <p className="font-medium text-gray-700 mt-0.5">{ROLE_LABELS[user.role] ?? user.role}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Email</p>
                            <p className="font-medium text-gray-700 mt-0.5">{user.email}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        To change your role, contact an admin. Roles control what you can access in the CRM.
                    </p>
                </Section>
            </div>
        </AppLayout>
    );
}
