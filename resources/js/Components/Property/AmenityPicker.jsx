import AppIcon from '@/Components/AppIcon';
const CATEGORY_LABELS = {
    building:  'Building',
    unit:      'Unit',
    community: 'Community',
};

export default function AmenityPicker({ amenities, selected, onChange }) {
    const grouped = amenities.reduce((acc, a) => {
        const cat = a.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(a);
        return acc;
    }, {});

    function toggle(id) {
        onChange(
            selected.includes(id)
                ? selected.filter((x) => x !== id)
                : [...selected, id]
        );
    }

    return (
        <div className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                        {CATEGORY_LABELS[cat] ?? cat}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {items.map((amenity) => {
                            const isOn = selected.includes(amenity.id);
                            return (
                                <label
                                    key={amenity.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                                        isOn
                                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isOn}
                                        onChange={() => toggle(amenity.id)}
                                    />
                                    {amenity.icon && (
                                        <span className="text-gray-500"><AppIcon name={amenity.icon} className="w-4 h-4" /></span>
                                    )}
                                    <span className="truncate">{amenity.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
