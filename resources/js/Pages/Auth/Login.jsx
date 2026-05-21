import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Sign in — Nexsit Properties" />
            <div className="min-h-screen flex">

                {/* Left panel — brand */}
                <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
                    style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #064e3b 100%)' }}>

                    {/* Noise texture overlay */}
                    <div className="absolute inset-0 opacity-5"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

                    {/* Logo */}
                    <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                        </div>
                        <div>
                            <div className="text-white font-bold text-lg leading-none">Nexsit</div>
                            <div className="text-emerald-400 text-xs tracking-widest uppercase font-medium">Properties</div>
                        </div>
                    </div>

                    {/* Central content */}
                    <div className="relative space-y-8">
                        <div>
                            <h2 className="text-4xl font-bold text-white leading-tight">
                                Your complete<br />
                                <span className="text-emerald-400">property CRM</span><br />
                                in one place.
                            </h2>
                            <p className="mt-4 text-white/60 text-base leading-relaxed max-w-xs">
                                Manage leads, deals, tenancies, and properties — all streamlined for the Rwanda real estate market.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Properties', value: '10+' },
                                { label: 'Active Leads', value: '8+' },
                                { label: 'Tenancies', value: '3+' },
                            ].map(({ label, value }) => (
                                <div key={label} className="rounded-xl p-4"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div className="text-2xl font-bold text-white">{value}</div>
                                    <div className="text-xs text-white/50 mt-1">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative text-white/30 text-xs">
                        &copy; {new Date().getFullYear()} Nexsit Solutions · Kigali, Rwanda
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10"
                        style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />
                    <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full opacity-8"
                        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
                </div>

                {/* Right panel — form */}
                <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-white">

                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-10 lg:hidden">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                        </div>
                        <span className="font-bold text-gray-900">Nexsit Properties</span>
                    </div>

                    <div className="max-w-sm w-full mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                            <p className="mt-1 text-sm text-gray-500">Sign in to your workspace</p>
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email address
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`block w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                                        placeholder="admin@nexsit.rw"
                                    />
                                </div>
                                {errors.email && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
                                    {errors.email}
                                </p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Password
                                    </label>
                                    <Link href="/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </span>
                                    <input
                                        id="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`block w-full rounded-xl border pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                                    Keep me signed in
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ background: processing ? '#6b7280' : 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                                {processing ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Sign in
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Demo credentials hint */}
                        <div className="mt-8 rounded-xl border border-dashed border-gray-200 p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Demo credentials</p>
                            <div className="space-y-1 text-xs text-gray-500 font-mono">
                                <div><span className="text-gray-400">Admin:</span> admin@nexsit.rw · password</div>
                                <div><span className="text-gray-400">Agent:</span> alice@nexsit.rw · password</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
