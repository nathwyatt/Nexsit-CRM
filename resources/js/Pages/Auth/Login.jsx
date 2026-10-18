import { Head, Link, useForm, usePage } from '@inertiajs/react';

const FEATURES = [
    {
        title: 'Property listings',
        body: 'Publish sale & rental properties with photos to your own public page.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />,
    },
    {
        title: 'Leads & deals',
        body: 'Capture every enquiry and move deals through a visual pipeline.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />,
    },
    {
        title: 'Tenancies & rent',
        body: 'Track tenants, agreements, payments and receipts in one place.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
    },
    {
        title: 'Viewings & tasks',
        body: 'Schedule viewings, follow-ups and reminders for your whole team.',
        icon: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />,
    },
];

export default function Login({ status }) {
    const { brand } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const demoLink = `https://wa.me/${brand?.whatsapp ?? '250793104330'}?text=${encodeURIComponent('Hello Nexsit Solutions! I would like a demo of Nexsit Property CRM for my agency.')}`;

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Sign in" />
            <div className="min-h-screen flex bg-slate-50">

                {/* ── Left: product showcase ── */}
                <aside className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden text-white"
                    style={{ background: 'radial-gradient(900px 500px at 90% 0%, rgba(16,185,129,.22), transparent 60%), radial-gradient(700px 450px at 0% 100%, rgba(30,136,229,.22), transparent 60%), #041735' }}>
                    <div className="absolute inset-0 opacity-[0.06]"
                        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

                    <div className="relative flex items-center justify-between gap-4">
                        <a href={brand?.website ?? 'https://nexsitsolution.com'} aria-label="Nexsit Solutions">
                            <img src="/images/nexsit-logo-wide.jpg" alt="Nexsit Solutions" className="h-12 w-auto" />
                        </a>
                        <Link href="/listings"
                            className="text-sm font-semibold text-white/75 hover:text-white border border-white/20 hover:border-emerald-300 rounded-full px-4 py-2 transition-colors">
                            Browse listings →
                        </Link>
                    </div>

                    <div className="relative max-w-xl">
                        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-emerald-300 bg-emerald-400/10 border border-emerald-300/30 rounded-full px-3.5 py-1.5 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                            Nexsit Property CRM
                        </div>
                        <h2 className="text-4xl xl:text-[44px] font-extrabold leading-[1.1] tracking-tight">
                            Run your real estate agency <span className="text-emerald-300">from one place</span>
                        </h2>
                        <p className="mt-4 text-white/70 text-base leading-relaxed">
                            List properties, capture leads, close deals and manage tenancies — built for agencies in Rwanda.
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-9">
                            {FEATURES.map(f => (
                                <div key={f.title} className="rounded-2xl p-4 bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-colors">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>{f.icon}</svg>
                                    </div>
                                    <div className="font-semibold text-[15px]">{f.title}</div>
                                    <div className="text-xs text-white/55 mt-1 leading-relaxed">{f.body}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/50">
                        <span>A product of Nexsit Solutions, Kigali</span>
                        {brand?.phone && <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="hover:text-white">{brand.phone}</a>}
                        {brand?.email && <a href={`mailto:${brand.email}`} className="hover:text-white">{brand.email}</a>}
                    </div>
                </aside>

                {/* ── Right: sign-in ── */}
                <main className="flex-1 flex flex-col justify-center px-5 py-10 sm:px-10">
                    <div className="max-w-md w-full mx-auto">

                        {/* Mobile brand */}
                        <div className="lg:hidden rounded-2xl px-5 py-4 mb-8 text-center" style={{ background: '#041735' }}>
                            <img src="/images/nexsit-logo-wide.jpg" alt="Nexsit Solutions" className="h-10 w-auto mx-auto" />
                            <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-300 mt-1.5">Property CRM</p>
                        </div>

                        <div className="mb-7">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
                            <p className="mt-1.5 text-[15px] text-slate-500">Sign in to your agency workspace.</p>
                        </div>

                        {status && (
                            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                                </svg>
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-slate-800 mb-1.5">Email address</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                        <svg className="w-[18px] h-[18px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </span>
                                    <input id="email" type="email" autoComplete="email" required autoFocus
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`block w-full rounded-xl border pl-11 pr-4 py-3 text-[15px] text-slate-900 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${errors.email ? 'border-red-300' : 'border-slate-300 hover:border-slate-400'}`}
                                        placeholder="you@agency.com" />
                                </div>
                                {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-800">Password</label>
                                    <Link href="/forgot-password" className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold">Forgot password?</Link>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                                        <svg className="w-[18px] h-[18px] text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </span>
                                    <input id="password" type="password" autoComplete="current-password" required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`block w-full rounded-xl border pl-11 pr-4 py-3 text-[15px] text-slate-900 placeholder-slate-400 bg-white transition focus:outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 ${errors.password ? 'border-red-300' : 'border-slate-300 hover:border-slate-400'}`}
                                        placeholder="Enter your password" />
                                </div>
                                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
                                <input type="checkbox" checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                                <span className="text-sm text-slate-600">Keep me signed in</span>
                            </label>

                            <button type="submit" disabled={processing}
                                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 55%, #1e88e5 130%)' }}>
                                {processing ? 'Signing in…' : 'Sign in'}
                                {!processing && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                )}
                            </button>
                        </form>

                        <div className="flex items-center gap-3 my-7 text-sm text-slate-400">
                            <span className="flex-1 h-px bg-slate-200" />New to Nexsit Property CRM?<span className="flex-1 h-px bg-slate-200" />
                        </div>

                        <a href={demoLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#25D366] hover:shadow-lg hover:shadow-[#25D366]/10 hover:-translate-y-0.5 transition">
                            <span className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.9 9.9 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.88 9.88 0 0 1 9.88 9.9c0 5.45-4.44 9.88-9.89 9.88zm8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41z"/></svg>
                            </span>
                            <span className="flex-1">
                                <span className="block font-bold text-slate-900">Request a free demo</span>
                                <span className="block text-sm text-slate-500">Chat with our team on WhatsApp to get started</span>
                            </span>
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </a>

                        <p className="text-center text-sm text-slate-400 mt-8">
                            <Link href="/listings" className="font-semibold text-slate-600 hover:text-emerald-700 lg:hidden">Browse property listings · </Link>
                            © Nexsit Solutions · <a href={brand?.website ?? 'https://nexsitsolution.com'} className="font-semibold text-slate-600 hover:text-emerald-700">nexsitsolution.com</a>
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
