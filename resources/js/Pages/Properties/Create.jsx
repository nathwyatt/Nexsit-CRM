import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PropertyForm from '@/Components/Property/PropertyForm';

export default function PropertyCreate({ propertyTypes, amenities, agents }) {
    const { data, setData, post, processing, errors } = useForm({
        title:            '',
        description:      null,
        property_type_id: null,
        purpose:          'sale',
        status:           'available',
        bedrooms:         null,
        bathrooms:        null,
        area_sqm:         null,
        floor:            null,
        total_floors:     null,
        building:         null,
        community:        null,
        city:             'Kigali',
        country:          'RW',
        latitude:         null,
        longitude:        null,
        price:            null,
        rent_price:       null,
        rent_frequency:   'monthly',
        service_charge:   null,
        is_furnished:     null,
        permit_number:    null,
        meta_title:       null,
        meta_description: null,
        assigned_to:      null,
        amenity_ids:      [],
    });

    function submit(e) {
        e.preventDefault();
        post('/properties');
    }

    return (
        <AppLayout title="Add Property">
            <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/properties" className="hover:text-indigo-600">Properties</Link>
                    <span>/</span>
                    <span className="text-gray-900">New property</span>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <PropertyForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        propertyTypes={propertyTypes}
                        amenities={amenities}
                        agents={agents}
                    />

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Create property'}
                        </button>
                        <Link href="/properties" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
