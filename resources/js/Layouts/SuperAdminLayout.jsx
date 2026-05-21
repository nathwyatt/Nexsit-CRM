import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

const NAV = [
    {
        href:  '/superadmin',
        label: 'Dashboard',
        exact: true,
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
    },
    {
        href:  '/superadmin/companies',
        label: 'Companies',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
        ),
    },
    {
        href:  '/superadmin/plans',
        label: 'Plans',
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 010 2.624 3.745 3.745 0 01-2.625 2.625 3.744 3.744 0 01-2.624 0 3.745 3.745 0 01-3.068-1.593 3.744 3.744 0 01-2.624 0 3.745 3.745 0 01-2.625-2.625 3.744 3.744 0 010-2.624A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 010-2.624 3.745 3.745 0 012.625-2.625 3.744 3.744 0 012.624 0A3.744 3.744 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.744 3.744 0 012.624 0 3.745 3.745 0 012.625 2.625 3.744 3.744 0 010 2.624A3.745 3.745 0 0121 12z" />
            </svg>
        ),
    },
];

const SUB_STATUS_BADGE = {
    trial:    'bg-amber-100 text-amber-700',
    active:   'bg-emerald-100 text-emerald-700',
    past_due: 'bg-red-100 text-red-700',
    cancelled:'bg-gray-100 text-gray-600',
    expired:  'bg-gray-100 text-gray-500',
    none:     'bg-gray-100 text-gray-400',
};

export { SUB_STATUS_BADGE };

export default function SuperAdminLayout({ title, children }) {
    const { url } = usePage();
    const { auth, flash } = usePage().props;

    const isActive = (item) =>
        item.exact ? url === item.href : url.startsWith(item.href);

    return (
        <div className="flex h-screen" style={{ background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside className="w-56 shrink-0 flex flex-col" style={{ background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)' }}>
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/10 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center shrink-0 shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-white font-bold text-xs leading-none">Nexsit</p>
                        <p className="text-violet-300 text-[9px] font-bold uppercase tracking-widest mt-0.5">Super Admin</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-0.5">
                    {NAV.map(item => {
                        const active = isActive(item);
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-violet-500/20 text-violet-200'
                                        : 'text-white/60 hover:bg-white/8 hover:text-white'
                                }`}>
                                <span className={active ? 'text-violet-300' : 'text-white/40'}>{item.icon}</span>
                                {item.label}
                                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to CRM + user */}
                <div className="px-3 py-3 border-t border-white/10 space-y-1 shrink-0">
                    <Link href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Back to CRM
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {auth.user.name.charAt(0)}
                        </div>
                        <p className="text-white/70 text-xs truncate">{auth.user.name}</p>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-100 shadow-sm shrink-0">
                    <h1 className="text-base font-bold text-gray-900">{title}</h1>
                    <span className="text-xs font-semibold bg-violet-100 text-violet-700 rounded-full px-3 py-1">
                        Super Admin
                    </span>
                </header>

                {/* Flash */}
                {(flash?.success || flash?.error) && (
                    <div className="px-6 pt-4">
                        {flash.success && (
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                                </svg>
                                {flash.success}
                            </div>
                        )}
                        {flash.error && (
                            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 flex items-center gap-2">
                                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                                </svg>
                                {flash.error}
                            </div>
                        )}
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
