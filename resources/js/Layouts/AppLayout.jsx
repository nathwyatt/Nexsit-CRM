import { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';
import NotificationBell from '@/Components/NotificationBell';
import CommandPalette from '@/Components/CommandPalette';

export default function AppLayout({ title, children }) {
    const { auth, flash, notifications_unread } = usePage().props;
    const [paletteOpen, setPaletteOpen] = useState(false);

    // Global Ctrl+K / Cmd+K shortcut
    useEffect(() => {
        function onKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setPaletteOpen(o => !o);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
            <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
            <Sidebar user={auth.user} />

            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Top bar */}
                <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-100 shrink-0 shadow-sm">
                    <h1 className="text-base font-bold text-gray-900 truncate">
                        {title}
                    </h1>

                    <div className="flex items-center gap-3">
                        {/* Search trigger */}
                        <button
                            onClick={() => setPaletteOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all text-sm text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <span className="hidden md:inline">Search…</span>
                            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-mono bg-white border border-gray-200 text-gray-400 shadow-sm">
                                ⌘K
                            </kbd>
                        </button>

                        <NotificationBell unreadCount={notifications_unread} />

                        <Link href="/profile" className="flex items-center gap-2.5 group ml-1">
                            {auth.user.avatar ? (
                                <img src={auth.user.avatar} alt={auth.user.name}
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow group-hover:ring-emerald-400 transition-all" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow group-hover:shadow-md transition-all">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-emerald-600 transition-colors">
                                {auth.user.name}
                            </span>
                        </Link>
                    </div>
                </header>

                {/* Flash messages */}
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

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
