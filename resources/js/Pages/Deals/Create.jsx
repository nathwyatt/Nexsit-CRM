import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import DealForm from '@/Components/Deal/DealForm';

export default function DealCreate({ pipelines, contacts, properties, agents }) {
    const firstPipeline = pipelines[0];
    const firstStage    = firstPipeline?.stages?.[0];

    const { data, setData, post, processing, errors } = useForm({
        pipeline_id:          firstPipeline?.id ?? null,
        stage_id:             firstStage?.id    ?? null,
        contact_id:           null,
        property_id:          null,
        title:                '',
        type:                 'sale',
        value:                null,
        commission_pct:       null,
        expected_close_date:  null,
        assigned_to:          null,
    });

    function submit(e) {
        e.preventDefault();
        post('/deals');
    }

    return (
        <AppLayout title="New Deal">
            <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/deals" className="hover:text-indigo-600">Deals</Link>
                    <span>/</span>
                    <span className="text-gray-900">New deal</span>
                </div>

                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <DealForm
                        data={data} setData={setData} errors={errors}
                        pipelines={pipelines} contacts={contacts} properties={properties} agents={agents}
                    />

                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                        <button type="submit" disabled={processing}
                            className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                            {processing ? 'Creating…' : 'Create deal'}
                        </button>
                        <Link href="/deals" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
