import { usePage } from '@inertiajs/react';

/** Currency code shared from config('nexsit.default_currency'), e.g. "RWF". */
export function useCurrency() {
    return usePage().props.currency ?? 'RWF';
}

export function formatMoney(amount, currency = 'RWF') {
    if (amount === null || amount === undefined || amount === '') return '—';
    return `${currency} ${Math.round(Number(amount)).toLocaleString()}`;
}

/** Rent period suffix. Rwanda rents are monthly, so an unset frequency means monthly. */
export function rentSuffix(frequency) {
    return { yearly: '/year', quarterly: '/quarter' }[frequency] ?? '/month';
}
