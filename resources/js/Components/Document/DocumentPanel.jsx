import { useRef, useState } from 'react';
import { useForm, router } from '@inertiajs/react';

const ICON_MAP = {
    'application/pdf':                      '📄',
    'application/msword':                   '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-excel':             '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
    'image/jpeg':  '🖼',
    'image/png':   '🖼',
    'image/webp':  '🖼',
};

function fileIcon(mime) {
    return ICON_MAP[mime] ?? '📎';
}

function UploadForm({ subject, documentTypes, onClose }) {
    const fileRef = useRef();
    const { data, setData, post, processing, errors, reset } = useForm({
        file:               null,
        name:               '',
        document_type_id:   '',
        expires_at:         '',
        notes:              '',
        documentable_type:  subject.type,
        documentable_id:    subject.id,
    });

    function handleFile(e) {
        const f = e.target.files[0];
        if (!f) return;
        setData(d => ({ ...d, file: f, name: d.name || f.name }));
    }

    function submit(e) {
        e.preventDefault();
        post('/documents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    }

    const inputCls = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Upload Document</p>
            <form onSubmit={submit} className="space-y-3">
                <div>
                    <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
                    <button type="button" onClick={() => fileRef.current.click()}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                        {data.file ? `✓ ${data.file.name}` : 'Choose file…'}
                    </button>
                    {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
                </div>

                <div>
                    <input value={data.name} onChange={e => setData('name', e.target.value)}
                        placeholder="Document name" className={inputCls} />
                </div>

                {documentTypes?.length > 0 && (
                    <div>
                        <select value={data.document_type_id}
                            onChange={e => setData('document_type_id', e.target.value)} className={inputCls}>
                            <option value="">— Type (optional) —</option>
                            {documentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <input type="date" value={data.expires_at}
                        onChange={e => setData('expires_at', e.target.value)}
                        className={inputCls} placeholder="Expiry date (optional)" />
                </div>

                <div>
                    <textarea rows={2} value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        placeholder="Notes (optional)"
                        className={`${inputCls} resize-none`} />
                </div>

                <div className="flex gap-2">
                    <button type="submit" disabled={processing || !data.file}
                        className="flex-1 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                        {processing ? 'Uploading…' : 'Upload'}
                    </button>
                    <button type="button" onClick={onClose}
                        className="px-3 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:border-gray-400">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function DocumentPanel({ documents = [], documentTypes = [], subject }) {
    const [showForm, setShowForm] = useState(false);

    function deleteDoc(id) {
        if (!confirm('Delete this document?')) return;
        router.delete(`/documents/${id}`, { preserveScroll: true });
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Documents</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{documents.length} file{documents.length !== 1 ? 's' : ''}</p>
                </div>
                {!showForm && (
                    <button onClick={() => setShowForm(true)}
                        className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                        + Upload
                    </button>
                )}
            </div>

            <div className="p-4 space-y-3">
                {showForm && (
                    <UploadForm subject={subject} documentTypes={documentTypes} onClose={() => setShowForm(false)} />
                )}

                {documents.length > 0 ? (
                    <ul className="divide-y divide-gray-50">
                        {documents.map(doc => (
                            <li key={doc.id} className="flex items-start gap-3 py-3 group">
                                <span className="text-xl shrink-0 mt-0.5">{fileIcon(doc.mime_type)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                        {doc.document_type && (
                                            <span className="text-xs text-indigo-600">{doc.document_type.name}</span>
                                        )}
                                        <span className="text-xs text-gray-400">{doc.size}</span>
                                        {doc.expires_at && (
                                            <span className={`text-xs font-medium ${
                                                doc.is_expired ? 'text-red-600' :
                                                doc.expiring_soon ? 'text-orange-500' : 'text-gray-400'
                                            }`}>
                                                {doc.is_expired ? '⚠ expired' : `exp. ${doc.expires_at}`}
                                            </span>
                                        )}
                                    </div>
                                    {doc.notes && (
                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.notes}</p>
                                    )}
                                    <p className="text-xs text-gray-300 mt-0.5">
                                        {doc.uploaded_by?.name ?? 'Unknown'} · {doc.created_at}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={doc.download_url}
                                        className="text-xs px-2 py-1 text-indigo-600 hover:text-indigo-800 border border-gray-200 rounded hover:border-indigo-300">
                                        ↓
                                    </a>
                                    <button onClick={() => deleteDoc(doc.id)}
                                        className="text-xs px-2 py-1 text-red-500 hover:text-red-700 border border-gray-200 rounded hover:border-red-300">
                                        ×
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    !showForm && (
                        <p className="text-xs text-gray-400 text-center py-4">No documents yet.</p>
                    )
                )}
            </div>
        </div>
    );
}
