import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ContactForm from '@/Components/Contact/ContactForm';

export default function ContactEdit({ contact, agents }) {
    const { data, setData, put, processing, errors } = useForm({
        first_name:  contact.first_name,
        last_name:   contact.last_name,
        email:       contact.email,
        phone:       contact.phone,
        phone_2:     contact.phone_2,
        nationality: contact.nationality,
        id_type:     contact.id_type,
        id_number:   contact.id_number,
        address:     contact.address,
        notes:       contact.notes,
        tags:        contact.tags ?? [],
        assigned_to: contact.assigned_to,
    });

    function submit(e) {
        e.preventDefault();
        put(`/contacts/${contact.id}`);
    }

    return (
        <AppLayout title="Edit Contact">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/contacts" className="hover:text-indigo-600">Contacts</Link>
                    <span>/</span>
                    <Link href={`/contacts/${contact.id}`} className="hover:text-indigo-600">
                        {contact.first_name} {contact.last_name}
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900">Edit</span>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <ContactForm data={data} setData={setData} errors={errors} agents={agents} />

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Save changes'}
                        </button>
                        <Link href={`/contacts/${contact.id}`} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
