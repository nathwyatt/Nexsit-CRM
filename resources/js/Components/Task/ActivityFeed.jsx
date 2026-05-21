const ACTION_ICONS = {
    stage_changed:  '→',
    status_changed: '◉',
    assigned:       '◎',
    converted:      '✦',
    created:        '+',
};

export default function ActivityFeed({ activities = [] }) {
    if (activities.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Activity</h3>
                <p className="text-sm text-gray-400">No activity yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Activity</h3>
            <ol className="relative border-l border-gray-100 space-y-4 ml-2">
                {activities.map(a => (
                    <li key={a.id} className="pl-5 relative">
                        <span className="absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs text-indigo-500">
                            {ACTION_ICONS[a.action] ?? '·'}
                        </span>
                        <p className="text-sm text-gray-700">{a.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {a.user?.name ?? 'System'} · {a.created_at}
                        </p>
                    </li>
                ))}
            </ol>
        </div>
    );
}
