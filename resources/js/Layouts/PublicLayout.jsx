import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

function BrandMark({ company, dark = false }) {
    if (company?.slug) {
        return (
            <>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold">{company.name?.[0] ?? 'N'}</span>
                </div>
                <div className="leading-none">
                    <span className={`font-bold text-base tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{company.name}</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold tracking-widest uppercase mt-0.5">Properties</span>
                </div>
            </>
        );
    }
    return (
        <>
            <img src="/images/nexsit-logo-mark.jpg" alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
            <div className="leading-none">
                <span className={`font-bold text-base tracking-tight ${dark ? 'text-white' : 'text-gray-900'}`}>Nexsit</span>
                <span className="block text-[10px] text-emerald-600 font-semibold tracking-widest uppercase mt-0.5">Properties</span>
            </div>
        </>
    );
}

export default function PublicLayout({ title, company, children }) {
    const { flash, brand } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    // Agency contact when browsing one agency (or a listing), otherwise Nexsit's
    const contact = {
        name:     company?.name ?? brand?.name ?? 'Nexsit Properties',
        phone:    company?.phone ?? brand?.phone,
        whatsapp: company?.whatsapp ?? brand?.whatsapp,
        email:    company?.email ?? brand?.email,
        city:     company?.city ?? brand?.city ?? 'Kigali, Rwanda',
    };
    const homeHref = company?.slug ? `/listings?company=${company.slug}` : '/listings';
    const q = (extra) => company?.slug ? `/listings?company=${company.slug}&${extra}` : `/listings?${extra}`;
    const waIcon = (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.38 1.26 4.81L2.05 22l5.36-1.41c1.37.74 2.93 1.17 4.63 1.17 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.52 14.14c-.23.65-1.35 1.24-1.86 1.32-.48.07-1.08.1-1.74-.11-.4-.13-.92-.3-1.58-.58-2.78-1.2-4.6-4-4.74-4.18-.14-.19-1.13-1.5-1.13-2.86s.72-2.03.97-2.31c.26-.28.56-.35.75-.35h.54c.17 0 .41-.07.64.49.23.57.8 1.95.87 2.1.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.17-.3.37-.42.5-.14.14-.29.29-.12.57.16.28.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.14.45.12.61-.07.17-.19.71-.82.9-1.11.19-.28.37-.23.63-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.11.07.66-.16 1.31z"/></svg>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Head title={title} />
            {/* ── Navbar ── */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href={homeHref} className="flex items-center gap-2.5 shrink-0">
                        <BrandMark company={company} />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden sm:flex items-center gap-1">
                        <Link href={q('purpose=sale')}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors">
                            For Sale
                        </Link>
                        <Link href={q('purpose=rent')}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors">
                            For Rent
                        </Link>
                        <Link href={homeHref}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg font-medium transition-colors">
                            All Properties
                        </Link>
                        <div className="w-px h-5 bg-gray-200 mx-2" />
                        {contact.whatsapp && (
                            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
                                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors shadow-sm flex items-center gap-2">
                                {waIcon}
                                Contact us
                            </a>
                        )}
                    </nav>

                    {/* Mobile hamburger */}
                    <button onClick={() => setMobileOpen(o => !o)}
                        className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                        <div className="space-y-1.5">
                            <span className={`block w-5 h-0.5 bg-current transition-transform ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`block w-5 h-0.5 bg-current transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
                            <span className={`block w-5 h-0.5 bg-current transition-transform ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </div>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
                        <Link href={q('purpose=sale')} onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg">For Sale</Link>
                        <Link href={q('purpose=rent')} onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg">For Rent</Link>
                        <Link href={homeHref} onClick={() => setMobileOpen(false)}
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50 rounded-lg">All Properties</Link>
                        {contact.whatsapp && (
                            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
                                className="block px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg text-center font-semibold mt-2">
                                Contact us on WhatsApp
                            </a>
                        )}
                    </div>
                )}
            </header>

            {/* Flash messages */}
            {(flash?.success || flash?.error) && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 w-full">
                    {flash.success && (
                        <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-800 flex items-start gap-3">
                            <span className="text-emerald-500 text-lg leading-none shrink-0">✓</span>
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-800">
                            {flash.error}
                        </div>
                    )}
                </div>
            )}

            <main className="flex-1">{children}</main>

            {/* ── Footer ── */}
            <footer className="bg-gray-900 text-gray-300 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
                        <div>
                            <div className="flex items-center gap-2.5 mb-3">
                                <BrandMark company={company} dark />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {company?.slug
                                    ? `Browse ${company.name}'s properties for sale and rent, and contact the team directly.`
                                    : 'Find homes, apartments, offices and land for sale or rent across Kigali and Rwanda.'}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">Browse</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href={q('purpose=sale')} className="hover:text-emerald-400 transition-colors">Properties for Sale</Link></li>
                                <li><Link href={q('purpose=rent')} className="hover:text-emerald-400 transition-colors">Properties for Rent</Link></li>
                                <li><Link href={homeHref} className="hover:text-emerald-400 transition-colors">All Listings</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
                            <ul className="space-y-2.5 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    {contact.city}
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                    <a href={`tel:${(contact.phone ?? '').replace(/\s/g, '')}`} className="hover:text-emerald-400">{contact.phone}</a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                    <a href={`mailto:${contact.email}`} className="hover:text-emerald-400 break-all">{contact.email}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                        <p>© {contact.name} · Powered by <a href={brand?.website ?? 'https://nexsitsolution.com'} className="hover:text-emerald-400">Nexsit Property CRM</a></p>
                        <Link href="/login" className="hover:text-emerald-400 transition-colors">Agent login →</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
