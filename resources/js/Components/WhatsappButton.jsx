import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function WhatsappButton({ phone, module, modelId }) {
    const { whatsapp_templates } = usePage().props;
    const [open, setOpen]       = useState(false);
    const [loading, setLoading] = useState(false);
    const [sent, setSent]       = useState(false);
    const ref = useRef(null);

    const templates = (whatsapp_templates ?? []).filter(
        t => t.is_active && (t.module === module || t.module === 'general')
    );

    useEffect(() => {
        if (!open) return;
        function onMouseDown(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, [open]);

    async function send(templateId = null) {
        setOpen(false);

        if (!templateId) {
            const clean = (phone ?? '').replace(/\D/g, '');
            window.open('https://wa.me/' + clean, '_blank');
            return;
        }

        setLoading(true);
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content ?? '';
            const res  = await fetch('/whatsapp/compose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf,
                    'Accept':       'application/json',
                },
                body: JSON.stringify({ module, model_id: modelId, template_id: templateId, phone }),
            });
            if (res.ok) {
                const json = await res.json();
                window.open(json.url, '_blank');
                setSent(true);
                setTimeout(() => setSent(false), 2000);
            }
        } finally {
            setLoading(false);
        }
    }

    if (!phone) {
        return (
            <span title="No phone number on record"
                className="text-xs text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 cursor-not-allowed select-none">
                💬 WhatsApp
            </span>
        );
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => templates.length > 0 ? setOpen(o => !o) : send(null)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors shadow-sm">
                <span>💬</span>
                {sent ? 'Opening…' : loading ? '…' : 'WhatsApp'}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="bg-green-600 px-4 py-3">
                        <p className="text-xs font-semibold text-white">Send WhatsApp</p>
                        <p className="text-xs text-green-100 font-mono mt-0.5">{phone}</p>
                    </div>

                    <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                        <button onClick={() => send(null)}
                            className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 border border-dashed border-gray-200 transition-colors">
                            <p className="text-xs font-medium text-gray-800 flex items-center gap-1.5">
                                <span>📱</span> Open chat directly
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">No pre-filled message</p>
                        </button>

                        {templates.length > 0 && (
                            <>
                                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    Templates
                                </p>
                                {templates.map(t => (
                                    <button key={t.id} onClick={() => send(t.id)}
                                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-green-50 border border-transparent hover:border-green-200 transition-colors">
                                        <p className="text-xs font-medium text-gray-800">{t.name}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 font-mono leading-relaxed">
                                            {t.body}
                                        </p>
                                    </button>
                                ))}
                            </>
                        )}

                        {templates.length === 0 && (
                            <p className="px-3 py-3 text-xs text-gray-400 text-center leading-relaxed">
                                No templates yet.{' '}
                                <a href="/settings/whatsapp" className="text-green-600 hover:underline font-medium">
                                    Create templates →
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
