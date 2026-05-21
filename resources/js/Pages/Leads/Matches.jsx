import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
    const r        = 22;
    const circ     = 2 * Math.PI * r;
    const filled   = circ * (score / 100);

    const color =
        score >= 80 ? '#059669' :
        score >= 60 ? '#d97706' :
        score >= 40 ? '#ea580c' : '#9ca3af';

    return (
        <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={r} fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <circle
                    cx="28" cy="28" r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${filled} ${circ}`}
                />
            </svg>
            <span className="absolute text-xs font-bold" style={{ color }}>
                {score}
            </span>
        </div>
    );
}

// ── Score badge label ─────────────────────────────────────────────────────────

function ScoreLabel({ score }) {
    if (score >= 80) return <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Excellent</span>;
    if (score >= 60) return <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Good</span>;
    if (score >= 40) return <span className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">Partial</span>;
    return <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Weak</span>;
}

// ── Status dot ────────────────────────────────────────────────────────────────

const STATUS_DOT = {
    available: 'bg-emerald-400',
    reserved:  'bg-amber-400',
    sold:      'bg-red-400',
    rented:    'bg-purple-400',
};

function StatusDot({ status }) {
    return <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[status] ?? 'bg-gray-300'}`} />;
}

// ── Property match card ───────────────────────────────────────────────────────

function MatchCard({ match, lead }) {
    const price = match.price ? `RWF ${Number(match.price).toLocaleString()}` : '—';

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group">
            {/* Photo */}
            <div className="relative h-36 bg-gray-100 overflow-hidden">
                {match.photo ? (
                    <img src={match.photo} alt={match.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M2.25 12L11.204 3.045a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </div>
                )}

                {/* Score overlay */}
                <div className="absolute top-2 right-2">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-sm flex flex-col items-center gap-0.5">
                        <ScoreRing score={match.score} />
                        <ScoreLabel score={match.score} />
                    </div>
                </div>

                {/* Status badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <StatusDot status={match.status} />
                    <span className="text-[10px] font-semibold text-gray-700 capitalize">{match.status}</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 flex-1">
                        {match.title}
                    </h3>
                </div>

                <p className="text-xs font-mono text-gray-400 mb-2">{match.reference}</p>

                {match.property_type && (
                    <span className="inline-block text-[10px] font-medium bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5 mb-2">
                        {match.property_type}
                    </span>
                )}

                {/* Price */}
                <p className="text-base font-bold text-gray-900 mb-2">{price}</p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    {match.bedrooms != null && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12V7a1 1 0 011-1h16a1 1 0 011 1v5M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M3 12h18M7 7V4m10 3V4" />
                            </svg>
                            {match.bedrooms} bd
                        </span>
                    )}
                    {match.bathrooms != null && (
                        <span>{match.bathrooms} ba</span>
                    )}
                    {match.area_sqm && (
                        <span>{Number(match.area_sqm).toLocaleString()} m²</span>
                    )}
                </div>

                {/* Location */}
                {(match.community || match.city) && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {[match.community, match.city].filter(Boolean).join(', ')}
                    </p>
                )}

                {/* Score breakdown */}
                {match.score_detail && (
                    <div className="mb-3 space-y-1">
                        {Object.entries(match.score_detail).map(([key, d]) => (
                            <div key={key} className="flex items-center gap-2">
                                <div className="w-16 h-1 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                    <div
                                        className="h-full rounded-full bg-emerald-400 transition-all"
                                        style={{ width: `${(d.score / (key === 'budget' ? 50 : key === 'bedrooms' ? 30 : 20)) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400 truncate">{d.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Link
                        href={`/viewings/create?property_id=${match.id}${lead.id ? `&lead_id=${lead.id}` : ''}`}
                        className="flex-1 text-center text-xs font-semibold py-1.5 rounded-lg text-white transition"
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
                    >
                        Book Viewing
                    </Link>
                    <Link
                        href={`/properties/${match.id}`}
                        className="flex-1 text-center text-xs font-medium py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                    >
                        View →
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Requirement chip ──────────────────────────────────────────────────────────

function ReqChip({ icon, label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-gray-400">{icon}</span>
            <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LeadMatches({ lead, matches, scanned }) {
    const hasMatches = matches.length > 0;

    const budgetLabel = lead.budget_max
        ? lead.budget_min
            ? `RWF ${Number(lead.budget_min).toLocaleString()} – ${Number(lead.budget_max).toLocaleString()}`
            : `Up to RWF ${Number(lead.budget_max).toLocaleString()}`
        : null;

    const excellent = matches.filter(m => m.score >= 80).length;
    const good      = matches.filter(m => m.score >= 60 && m.score < 80).length;

    return (
        <AppLayout title={`Matches — ${lead.reference}`}>
            <div className="max-w-6xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/leads" className="hover:text-emerald-600">Leads</Link>
                    <span>/</span>
                    <Link href={`/leads/${lead.id}`} className="hover:text-emerald-600">{lead.reference}</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Property Matches</span>
                </div>

                {/* Lead summary header */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                    style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                    </svg>
                                </div>
                                <h1 className="text-lg font-bold text-gray-900">Property Matching</h1>
                            </div>
                            <p className="text-sm text-gray-500">
                                {lead.contact ? (
                                    <>Showing best matches for <span className="font-medium text-gray-800">{lead.contact.name}</span></>
                                ) : (
                                    <>Matches for <span className="font-mono text-gray-700">{lead.reference}</span></>
                                )}
                                {' '}· Scanned {scanned} properties
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {excellent > 0 && (
                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1">
                                    {excellent} excellent
                                </span>
                            )}
                            {good > 0 && (
                                <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                                    {good} good
                                </span>
                            )}
                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 rounded-full px-3 py-1">
                                {matches.length} total
                            </span>
                        </div>
                    </div>

                    {/* Requirements chips */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <ReqChip
                            icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12L11.204 3.045a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                </svg>
                            }
                            label="Purpose"
                            value={lead.purpose === 'buy' ? 'Buy' : 'Rent'}
                        />
                        {budgetLabel && (
                            <ReqChip
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                                    </svg>
                                }
                                label="Budget"
                                value={budgetLabel}
                            />
                        )}
                        {lead.bedrooms_wanted != null && (
                            <ReqChip
                                icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12V7a1 1 0 011-1h16a1 1 0 011 1v5M3 12v5a1 1 0 001 1h16a1 1 0 001-1v-5M3 12h18M7 7V4m10 3V4" />
                                    </svg>
                                }
                                label="Bedrooms"
                                value={`${lead.bedrooms_wanted} bedroom${lead.bedrooms_wanted !== 1 ? 's' : ''}`}
                            />
                        )}
                    </div>
                </div>

                {/* Results */}
                {!hasMatches ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-700 mb-1">No matching properties</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            No properties match this lead's criteria. Try adding more properties or adjusting the lead's budget.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link href="/properties/create"
                                className="text-sm font-medium px-4 py-2 rounded-xl text-white transition"
                                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}>
                                Add Property
                            </Link>
                            <Link href={`/leads/${lead.id}/edit`}
                                className="text-sm font-medium px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                                Edit Lead Requirements
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Score legend */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                            {[
                                { color: '#059669', label: 'Excellent match (80–100)' },
                                { color: '#d97706', label: 'Good match (60–79)' },
                                { color: '#ea580c', label: 'Partial match (40–59)' },
                                { color: '#9ca3af', label: 'Weak match (<40)' },
                            ].map(item => (
                                <span key={item.label} className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    {item.label}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {matches.map(match => (
                                <MatchCard key={match.id} match={match} lead={lead} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
