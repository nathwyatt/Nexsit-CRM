import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';

export default function NotificationBell({ unreadCount: initialCount }) {
    const [open, setOpen]           = useState(false);
    const [items, setItems]         = useState([]);
    const [loading, setLoading]     = useState(false);
    const [unread, setUnread]       = useState(initialCount ?? 0);
    const dropdownRef               = useRef(null);

    // Fetch notifications when bell opens
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res  = await fetch('/notifications', { headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } });
            const data = await res.json();
            setItems(data);
            setUnread(data.filter(n => !n.read).length);
        } catch (_) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) fetchNotifications();
    }, [open]);

    // Close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    async function markRead(id) {
        await fetch(`/notifications/${id}/read`, {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                'Accept': 'application/json',
            },
        });
        setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
    }

    async function markAllRead() {
        await fetch('/notifications/read-all', {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                'Accept': 'application/json',
            },
        });
        setItems(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    }

    function handleItemClick(item) {
        if (!item.read) markRead(item.id);
        setOpen(false);
        if (item.link) router.visit(item.link);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(o => !o)}
                className="relative p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full leading-none">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">Notifications</span>
                        {unread > 0 && (
                            <button onClick={markAllRead}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {loading && (
                            <div className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</div>
                        )}

                        {!loading && items.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-2xl mb-1">🔔</p>
                                <p className="text-sm text-gray-400">No notifications yet</p>
                            </div>
                        )}

                        {!loading && items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                                    !item.read ? 'bg-indigo-50/40' : ''
                                }`}
                            >
                                <span className="text-lg leading-none shrink-0 mt-0.5">{item.icon}</span>
                                <div className="min-w-0 flex-1">
                                    <p className={`text-sm leading-snug ${!item.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                                        {item.body}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{item.created_at}</p>
                                </div>
                                {!item.read && (
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                                )}
                            </button>
                        ))}
                    </div>

                    {items.length > 0 && (
                        <div className="border-t border-gray-100 px-4 py-2 text-center">
                            <span className="text-xs text-gray-400">Showing last {items.length} notifications</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
