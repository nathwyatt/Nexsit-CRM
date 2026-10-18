import {
    ArrowUpDown, Armchair, Bath, BedSingle, BellRing, BookOpen, Box, Briefcase, Building, Building2,
    Calendar, Camera, Car, CircleDot, DoorOpen, Droplets, Dumbbell, Fence, Flame, Footprints, Globe,
    Home, Hotel, House, Key, Landmark, Layers, Lock, Mail, Map as MapIcon, MessageCircle, Phone,
    Share2, Shield, ShoppingBag, ShowerHead, Signpost, Smile, Sofa, Square, Store, Sun, Sunset, Tag,
    Trees, Users, Utensils, Warehouse, Waves, Wifi, Wind, Zap,
} from 'lucide-react';

// Icon names stored in the database (property types, lead sources, amenities, task types)
export const ICONS = {
    'armchair': Armchair, 'arrow-up-down': ArrowUpDown, 'bath': Bath, 'bed-single': BedSingle,
    'bell-ring': BellRing, 'book-open': BookOpen, 'box': Box, 'briefcase': Briefcase,
    'building': Building, 'building-2': Building2, 'calendar': Calendar, 'camera': Camera, 'car': Car,
    'circle-dot': CircleDot, 'door-open': DoorOpen, 'droplets': Droplets, 'dumbbell': Dumbbell,
    'fence': Fence, 'flame': Flame, 'footprints': Footprints, 'globe': Globe, 'home': Home,
    'hotel': Hotel, 'house': House, 'key': Key, 'landmark': Landmark, 'layers': Layers, 'lock': Lock,
    'mail': Mail, 'map': MapIcon, 'message-circle': MessageCircle, 'phone': Phone, 'share-2': Share2,
    'shield': Shield, 'shopping-bag': ShoppingBag, 'shower-head': ShowerHead, 'signpost': Signpost,
    'smile': Smile, 'sofa': Sofa, 'square': Square, 'store': Store, 'sun': Sun, 'sunset': Sunset,
    'tag': Tag, 'trees': Trees, 'users': Users, 'utensils': Utensils, 'warehouse': Warehouse,
    'waves': Waves, 'wifi': Wifi, 'wind': Wind, 'zap': Zap,
};

const looksLikeIconName = (v) => /^[a-z0-9-]+$/.test(v);

/**
 * Renders a stored icon value: a known icon name becomes an SVG icon, an emoji is shown as-is,
 * and an unknown name renders nothing (instead of leaking the raw text into the UI).
 */
export default function AppIcon({ name, className = 'w-4 h-4', strokeWidth = 1.8 }) {
    if (!name) return null;
    const Icon = ICONS[name];
    if (Icon) return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
    if (looksLikeIconName(name)) return null;
    return <span className="leading-none" aria-hidden="true">{name}</span>;
}

/** Grid picker used in the settings forms. */
export function IconPicker({ value, onChange }) {
    return (
        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-md border border-gray-300 bg-white">
            <button type="button" onClick={() => onChange('')} title="No icon"
                className={`w-8 h-8 rounded-md border text-xs text-gray-400 flex items-center justify-center ${!value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400'}`}>
                —
            </button>
            {Object.entries(ICONS).map(([key, Icon]) => (
                <button key={key} type="button" onClick={() => onChange(key)} title={key}
                    className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${value === key ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                </button>
            ))}
        </div>
    );
}
