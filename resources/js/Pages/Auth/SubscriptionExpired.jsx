import { Link, useForm } from '@inertiajs/react';

export default function SubscriptionExpired({ user }) {
    const { post, processing } = useForm();

    function logout(e) {
        e.preventDefault();
        post('/logout');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Top banner */}
                    <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-500" />

                    <div className="p-8 text-center space-y-6">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>

                        {/* Heading */}
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Subscription Expired</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Hi {user?.name?.split(' ')[0] ?? 'there'}, your company's subscription is no longer active.
                            </p>
                        </div>

                        {/* Body text */}
                        <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 text-sm text-slate-600">
                            <p>Your access to Nexsit CRM has been temporarily suspended because:</p>
                            <ul className="space-y-1.5 pl-4 list-disc">
                                <li>Your trial period has ended, <strong>or</strong></li>
                                <li>Your subscription has expired or been cancelled</li>
                            </ul>
                            <p className="pt-1">
                                To restore access, please contact your administrator or reach out to Nexsit support.
                            </p>
                        </div>

                        {/* Contact */}
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 flex items-center gap-3">
                            <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <div className="text-left">
                                <p className="text-xs text-emerald-700 font-medium">Contact Nexsit Support</p>
                                <a href="mailto:support@nexsit.com"
                                    className="text-sm text-emerald-800 font-semibold hover:underline">
                                    support@nexsit.com
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <form onSubmit={logout}>
                                <button type="submit" disabled={processing}
                                    className="w-full py-2.5 px-4 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-700 disabled:opacity-50 font-semibold transition-colors">
                                    {processing ? 'Signing out…' : 'Sign Out'}
                                </button>
                            </form>
                            <Link href="/listings"
                                className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50 font-medium transition-colors text-center block">
                                View Public Listings
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-slate-400 mt-5">
                    Nexsit CRM &mdash; Real Estate Management Platform
                </p>
            </div>
        </div>
    );
}
