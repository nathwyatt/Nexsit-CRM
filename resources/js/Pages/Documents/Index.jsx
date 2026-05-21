import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const ENTITY_LABELS = {
    lead:     'Lead',
    deal:     'Deal',
    contact:  'Contact',
    property: 'Property',
    tenancy:  'Tenancy',
};

const ICON_MAP = {
    'application/pdf':   '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'image/jpeg': '🖼',
    'image/png':  '🖼',
    'image/webp': '🖼',
};

function fileIcon(mime) {
    return ICON_MAP[mime] ?? '📎';
}

function FilterBar({ filters, documentTypes }) {
    const [local, setLocal] = useState({
        search: filters.search ?? '',
        type:   filters.type ?? '',
        entity: filters.entity ?? '',
    });

    function apply(e) {
        e.preventDefault();
        const params = Object.fromEntries(Object.entries(local).filter(([, v]) => v !== ''));
        router.get('/documents', params, { preserveState: true });
    }

    const inputCls = 'rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <form onSubmit={apply} className="flex flex-wrap gap-3 items-center">
            <input value={local.search} onChange={e => setLocal(s => ({ ...s, search: e.target.value }))}
                placeholder="Search by name…"
                className={`${inputCls} min-w-48`} />
            <select value={local.type} onChange={e => setLocal(s => ({ ...s, type: e.target.value }))}
                className={inputCls}>
                <option value="">All types</option>
                {documentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={local.entity} onChange={e => setLocal(s => ({ ...s, entity: e.target.value }))}
                className={inputCls}>
                <option value="">All entities</option>
                {Object.entries(ENTITY_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                ))}
            </select>
            <button type="submit"
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                Filter
            </button>
            <button type="button" onClick={() => router.get('/documents')}
                className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:border-gray-400">
                Reset
            </button>
        </form>
    );
}

function DocumentRow({ doc }) {
    function handleDelete() {
        if (!confirm(`Delete "${doc.name}"?`)) return;
        router.delete(`/documents/${doc.id}`, { preserveScroll: true });
    }

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
            <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{fileIcon(doc.mime_type)}</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.size}</p>
                    </div>
                </div>
            </td>
            <td className="py-3 px-4">
                {doc.document_type ? (
                    <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                        {doc.document_type.name}
                    </span>
                ) : <span className="text-gray-300 text-xs">—</span>}
            </td>
            <td className="py-3 px-4 text-xs text-gray-500 capitalize">
                {ENTITY_LABELS[doc.documentable_type] ?? doc.documentable_type}
            </td>
            <td className="py-3 px-4">
                {doc.expires_at ? (
                    <span className={`text-xs font-medium ${
                        doc.is_expired ? 'text-red-600' :
                        doc.expiring_soon ? 'text-orange-500' : 'text-gray-500'
                    }`}>
                        {doc.is_expired ? '⚠ ' : ''}{doc.expires_at}
                    </span>
                ) : <span className="text-gray-300 text-xs">—</span>}
            </td>
            <td className="py-3 px-4 text-xs text-gray-400">
                {doc.uploaded_by?.name ?? '—'}
            </td>
            <td className="py-3 px-4 text-xs text-gray-400">{doc.created_at}</td>
            <td className="py-3 px-4">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={doc.download_url}
                        className="text-xs px-2 py-1 text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 font-medium">
                        Download
                    </a>
                    <button onClick={handleDelete}
                        className="text-xs px-2 py-1 text-red-500 border border-red-200 rounded hover:bg-red-50">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function DocumentsIndex({ documents, documentTypes, filters }) {
    const { data, meta, links } = documents;

    return (
        <AppLayout title="Documents">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Documents</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{meta?.total ?? 0} total</p>
                    </div>
                </div>

                <FilterBar filters={filters} documentTypes={documentTypes} />

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {data?.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['File', 'Type', 'Linked to', 'Expires', 'Uploaded by', 'Date', ''].map(h => (
                                        <th key={h} className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(doc => <DocumentRow key={doc.id} doc={doc} />)}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-16 text-center">
                            <p className="text-3xl mb-3">📂</p>
                            <p className="text-gray-500 text-sm">No documents found.</p>
                            <p className="text-xs text-gray-400 mt-1">Upload documents from any Lead, Deal, Contact, Property, or Tenancy.</p>
                        </div>
                    )}
                </div>

                {links && (
                    <div className="flex justify-center gap-1 flex-wrap">
                        {links.map((link, i) => (
                            <button key={i}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                                    link.active
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : link.url
                                            ? 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'
                                            : 'bg-white border-gray-200 text-gray-300 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
