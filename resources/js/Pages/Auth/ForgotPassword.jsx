import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    function submit(e) {
        e.preventDefault();
        post('/forgot-password');
    }

    return (
        <>
            <Head title="Forgot Password" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Nexsit CRM</h1>
                        <p className="mt-2 text-sm text-gray-500">Reset your password</p>
                    </div>

                    {status && (
                        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">{status}</div>
                    )}

                    <form onSubmit={submit} className="mt-8 bg-white shadow-sm rounded-xl p-8 border border-gray-100 space-y-6">
                        <p className="text-sm text-gray-600">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {processing ? 'Sending…' : 'Send reset link'}
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
                                ← Back to sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
