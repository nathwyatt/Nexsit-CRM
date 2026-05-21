import { useEffect, useRef, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

const TYPE_META = {
    contact:  { label: 'Contact',  color: 'bg-violet-100 text-violet-700' },
    lead:     { label: 'Lead',     color: 'bg-amber-100 text-amber-700' },
    deal:     { label: 'Deal',     color: 'bg-blue-100 text-blue-700' },
    property: { label: 'Property', color: 'bg-green-100 text-green-700' },
    tenancy:  { label: 'Tenancy',  color: 'bg-rose-100 text-rose-700' },
};

const ICON = {
    contact:  '👤',
    lead:     '📋',
    deal:     '💼',
    property: '🏢',
    tenancy:  '🏠',
};

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function CommandPalette({ open, onClose }) {
    const [query, setQuery]     = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeIdx, setIdx]   = useState(0);
    const inputRef              = useRef(null);
    const debouncedQ            = useDebounce(query, 200);

    // Reset state whenever palette opens
    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setIdx(0);
            setTimeout(() => inputRef.current?.focus(), 30);
        }
    }, [open]);

    // Fetch results
    useEffect(() => {
        if (!open) return;
        if (debouncedQ.length < 2) { setResults([]); return; }

        setLoading(true);
        const controller = new AbortController();

        fetch(`/search?q=${encodeURIComponent(debouncedQ)}`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then(r => r.json())
            .then(data => { setResults(data); setIdx(0); })
            .catch(() => {})
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [debouncedQ, open]);

    const navigate = useCallback((url) => {
        onClose();
        router.visit(url);
    }, [onClose]);

    // Keyboard navigation
    useEffect(() => {
        if (!open) return;

        function onKeyDown(e) {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIdx(i => Math.min(i + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIdx(i => Math.max(i - 1, 0));
            } else if (e.key === 'Enter' && results[activeIdx]) {
                navigate(results[activeIdx].url);
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, results, activeIdx, navigate, onClose]);

    if (!open) return null;

    const grouped = results.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item);
        return acc;
    }, {});

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />

            {/* Panel */}
            <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                    <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.197 5.197a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search contacts, leads, deals, properties…"
                        className="flex-1 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
                    />
                    {loading && (
                        <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin shrink-0" />
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono text-gray-400 bg-gray-100 border border-gray-200">
                        Esc
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[420px] overflow-y-auto">
                    {query.length >= 2 && !loading && results.length === 0 && (
                        <div className="px-4 py-10 text-center text-sm text-gray-400">
                            No results for <span className="font-medium text-gray-600">"{query}"</span>
                        </div>
                    )}

                    {query.length < 2 && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-gray-400">Type at least 2 characters to search</p>
                            <div className="flex justify-center gap-4 mt-4 flex-wrap">
                                {Object.entries(TYPE_META).map(([type, { label, color }]) => (
                                    <span key={type} className={`text-xs px-2.5 py-1 rounded-full font-medium ${color}`}>
                                        {ICON[type]} {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {Object.entries(grouped).map(([type, items]) => {
                        const meta = TYPE_META[type] ?? { label: type, color: 'bg-gray-100 text-gray-600' };
                        return (
                            <div key={type}>
                                <div className="px-4 pt-3 pb-1">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                                        {meta.label}s
                                    </span>
                                </div>
                                {items.map((item) => {
                                    const flatIdx = results.indexOf(item);
                                    const isActive = flatIdx === activeIdx;
                                    return (
                                        <button
                                            key={`${item.type}-${item.url}`}
                                            onMouseEnter={() => setIdx(flatIdx)}
                                            onClick={() => navigate(item.url)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                                isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-lg shrink-0">{ICON[item.type]}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isActive ? 'text-indigo-700' : 'text-gray-800'}`}>
                                                    {item.label}
                                                </p>
                                                {item.sub && (
                                                    <p className="text-xs text-gray-400 truncate">{item.sub}</p>
                                                )}
                                            </div>
                                            {isActive && (
                                                <span className="text-xs text-indigo-400 shrink-0">↵ Open</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {results.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
                            <span>↑↓ navigate</span>
                            <span>↵ open</span>
                            <span>Esc close</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
