import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ContactForm from '@/Components/Contact/ContactForm';

export default function ContactCreate({ agents }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name:  '',
        last_name:   '',
        email:       null,
        phone:       null,
        phone_2:     null,
        nationality: null,
        id_type:     null,
        id_number:   null,
        address:     null,
        notes:       null,
        tags:        [],
        assigned_to: null,
    });

    function submit(e) {
        e.preventDefault();
        post('/contacts');
    }

    return (
        <AppLayout title="Add Contact">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/contacts" className="hover:text-indigo-600">Contacts</Link>
                    <span>/</span>
                    <span className="text-gray-900">New contact</span>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <ContactForm data={data} setData={setData} errors={errors} agents={agents} />

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Saving…' : 'Create contact'}
                        </button>
                        <Link href="/contacts" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
