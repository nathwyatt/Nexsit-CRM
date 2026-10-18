import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

function StatusBadge({ status }) {
    return status === 'sent'
        ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Sent</span>
        : <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">Failed</span>;
}

export default function EmailLog({ logs }) {
    const { data, meta, links } = logs;

    return (
        <AppLayout title="Email Log">
            <div className="max-w-5xl space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Email Log</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            All outgoing emails sent by the CRM — {meta?.total ?? 0} total
                        </p>
                    </div>
                </div>

                {/* Setup notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                    <span className="text-lg shrink-0">⚙️</span>
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">SMTP Configuration Required</p>
                        <p className="text-xs text-amber-700 leading-relaxed">
                            To send real emails, configure your <code className="bg-amber-100 px-1 rounded">.env</code> file with SMTP credentials:
                        </p>
                        <pre className="mt-2 text-xs bg-amber-100 rounded-lg p-3 font-mono leading-relaxed overflow-x-auto">
{`MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Nexsit Properties"`}
                        </pre>
                        <p className="text-xs text-amber-600 mt-2">
                            During development, set <code className="bg-amber-100 px-1 rounded">MAIL_MAILER=log</code> to write emails to <code className="bg-amber-100 px-1 rounded">storage/logs/laravel.log</code> instead.
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {data?.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">To</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Subject</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Sent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900 text-sm">{log.to_name || '—'}</p>
                                            <p className="text-xs text-gray-400 font-mono">{log.to_email}</p>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <p className="text-sm text-gray-700 truncate max-w-xs">{log.subject}</p>
                                            {log.error && (
                                                <p className="text-xs text-red-500 mt-0.5 truncate max-w-xs" title={log.error}>
                                                    Error: {log.error}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={log.status} />
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-400">
                                            {log.created_at}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-3xl mb-3">✉</p>
                            <p className="text-gray-500 font-medium">No emails sent yet</p>
                            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
                                Emails are logged here when agents are assigned leads, web enquiries arrive, or tenancy reminders are sent.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {links && data?.length > 0 && (
                    <div className="flex justify-center gap-1.5 flex-wrap">
                        {links.map((link, i) => (
                            <button key={i}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 py-2 text-sm rounded-xl border transition-colors ${
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                                        : link.url
                                            ? 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400'
                                            : 'bg-white border-gray-100 text-gray-300 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
