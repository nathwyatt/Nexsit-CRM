import { useState, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const COLUMNS = ['first_name', 'last_name', 'email', 'phone', 'nationality', 'notes'];
const REQUIRED = ['first_name'];

function parseCSV(text) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    function splitLine(line) {
        const result = [];
        let cur = '', inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') { inQuote = !inQuote; }
            else if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ''; }
            else { cur += ch; }
        }
        result.push(cur.trim());
        return result;
    }

    const headers = splitLine(lines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, '').trim());
    const rows = lines.slice(1, 101).map((line, i) => {
        const vals = splitLine(line).map(v => v.replace(/^"|"$/g, '').trim());
        const obj  = Object.fromEntries(headers.map((h, j) => [h, vals[j] ?? '']));
        const errs = REQUIRED.filter(f => !obj[f]);
        return { _row: i + 2, _errors: errs, ...obj };
    });
    return { headers, rows };
}

export default function ContactsImport() {
    const { flash } = usePage().props;
    const importSuccess = flash?.import_success;
    const importErrors  = flash?.import_errors ?? [];

    const [file, setFile]       = useState(null);
    const [preview, setPreview] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);
    const formRef  = useRef(null);

    function handleFile(f) {
        if (!f) return;
        setFile(f);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(parseCSV(e.target.result));
        reader.readAsText(f, 'UTF-8');
    }

    function handleDrop(e) {
        e.preventDefault(); setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) handleFile(f);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!file) return;
        setSubmitting(true);
        const fd = new FormData(formRef.current);
        router.post('/contacts/import', fd, {
            forceFormData: true,
            onFinish: () => setSubmitting(false),
        });
    }

    const readyRows  = preview?.rows.filter(r => r._errors.length === 0).length ?? 0;
    const errorRows  = preview?.rows.filter(r => r._errors.length > 0).length ?? 0;

    return (
        <AppLayout title="Import Contacts">
            <div className="max-w-4xl space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/contacts" className="text-sm text-gray-400 hover:text-gray-700">← Contacts</Link>
                    <span className="text-gray-300">/</span>
                    <h1 className="text-xl font-bold text-gray-900">Import Contacts</h1>
                </div>

                {/* Result banner */}
                {importSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                        <p className="text-green-800 font-medium text-sm flex items-center gap-2">
                            <span>✓</span> {importSuccess}
                        </p>
                        {importErrors.length > 0 && (
                            <ul className="text-xs text-red-600 space-y-0.5 pl-5 list-disc">
                                {importErrors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                                {importErrors.length > 10 && <li>… and {importErrors.length - 10} more</li>}
                            </ul>
                        )}
                    </div>
                )}

                {/* Format guide */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-gray-800">Required CSV Format</h2>
                        <a href="/import/sample/contacts"
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50">
                            ↓ Download sample CSV
                        </a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="text-xs font-mono border-collapse w-full">
                            <thead>
                                <tr>
                                    {COLUMNS.map(c => (
                                        <th key={c} className={`px-3 py-2 text-left border border-gray-200 ${
                                            REQUIRED.includes(c) ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-50 text-gray-500'
                                        }`}>
                                            {c}{REQUIRED.includes(c) && <span className="text-red-500 ml-0.5">*</span>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {['Jean', 'Uwimana', 'jean@example.com', '+250781000001', 'Rwandan', 'VIP client'].map((v, i) => (
                                        <td key={i} className="px-3 py-1.5 border border-gray-100 text-gray-500">{v}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Duplicates (matched by email or phone) are automatically skipped. Max 5 MB.</p>
                </div>

                {/* Upload area */}
                <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
                    <div
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                        }`}>
                        <input ref={inputRef} type="file" name="file" accept=".csv,text/csv"
                            className="hidden" onChange={e => handleFile(e.target.files[0])} />
                        <p className="text-3xl mb-2">📄</p>
                        {file
                            ? <p className="text-sm font-medium text-indigo-700">{file.name}</p>
                            : <p className="text-sm text-gray-500">Drag & drop a <strong>.csv</strong> file here, or click to browse</p>
                        }
                    </div>

                    {/* Preview */}
                    {preview && preview.rows.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500">{preview.rows.length} rows detected</span>
                                <span className="text-green-700 font-medium">{readyRows} ready to import</span>
                                {errorRows > 0 && <span className="text-red-600">{errorRows} with errors (will be skipped)</span>}
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-500">#</th>
                                            {COLUMNS.map(c => (
                                                <th key={c} className="px-3 py-2 text-left font-semibold text-gray-500 capitalize">
                                                    {c.replace('_', ' ')}
                                                </th>
                                            ))}
                                            <th className="px-3 py-2 text-left font-semibold text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {preview.rows.slice(0, 20).map(row => (
                                            <tr key={row._row} className={row._errors.length ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                                <td className="px-3 py-2 text-gray-400">{row._row}</td>
                                                {COLUMNS.map(c => (
                                                    <td key={c} className={`px-3 py-2 max-w-[140px] truncate ${
                                                        REQUIRED.includes(c) && !row[c] ? 'text-red-500 font-medium' : 'text-gray-700'
                                                    }`}>{row[c] || <span className="text-gray-300">—</span>}</td>
                                                ))}
                                                <td className="px-3 py-2">
                                                    {row._errors.length === 0
                                                        ? <span className="text-green-600 font-medium">✓ Ready</span>
                                                        : <span className="text-red-500">Missing: {row._errors.join(', ')}</span>
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.rows.length > 20 && (
                                    <p className="text-center text-xs text-gray-400 py-2 border-t border-gray-100">
                                        Showing 20 of {preview.rows.length} rows
                                    </p>
                                )}
                            </div>

                            <button type="submit" disabled={submitting || readyRows === 0}
                                className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-sm">
                                {submitting ? 'Importing…' : `Import ${readyRows} contact${readyRows !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}
