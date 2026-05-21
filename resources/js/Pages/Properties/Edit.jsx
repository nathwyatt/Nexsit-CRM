import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PropertyForm from '@/Components/Property/PropertyForm';

export default function PropertyEdit({ property, propertyTypes, amenities, agents }) {
    const { data, setData, put, processing, errors } = useForm({
        title:            property.title,
        description:      property.description,
        property_type_id: property.property_type_id,
        purpose:          property.purpose,
        status:           property.status,
        bedrooms:         property.bedrooms,
        bathrooms:        property.bathrooms,
        area_sqm:         property.area_sqm,
        floor:            property.floor,
        total_floors:     property.total_floors,
        building:         property.building,
        community:        property.community,
        city:             property.city,
        country:          property.country,
        latitude:         property.latitude,
        longitude:        property.longitude,
        price:            property.price,
        rent_price:       property.rent_price,
        rent_frequency:   property.rent_frequency,
        service_charge:   property.service_charge,
        is_furnished:     property.is_furnished,
        permit_number:    property.permit_number,
        meta_title:       property.meta_title,
        meta_description: property.meta_description,
        assigned_to:      property.assigned_to,
        amenity_ids:      property.amenity_ids ?? [],
    });

    function submit(e) {
        e.preventDefault();
        put(`/properties/${property.id}`);
    }

    return (
        <AppLayout title={`Edit — ${property.reference}`}>
            <div className="max-w-3xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/properties" className="hover:text-indigo-600">Properties</Link>
                    <span>/</span>
                    <Link href={`/properties/${property.id}`} className="hover:text-indigo-600">{property.reference}</Link>
                    <span>/</span>
                    <span className="text-gray-900">Edit</span>
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
                            {processing ? 'Saving…' : 'Save changes'}
                        </button>
                        <Link href={`/properties/${property.id}`} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
