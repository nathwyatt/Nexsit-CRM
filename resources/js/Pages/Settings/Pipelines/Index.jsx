import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SortableList from '@/Components/SortableList';

const STAGE_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#3b82f6', '#ef4444', '#64748b',
];

const STAGE_TYPES = [
    { value: 'open', label: 'Open' },
    { value: 'won',  label: 'Won' },
    { value: 'lost', label: 'Lost' },
];

function StageForm({ pipelineId, stage, onDone }) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name:        stage?.name        ?? '',
        color:       stage?.color       ?? '#6366f1',
        probability: stage?.probability ?? 50,
        type:        stage?.type        ?? 'open',
    });

    function submit(e) {
        e.preventDefault();
        const url = stage
            ? `/settings/pipelines/${pipelineId}/stages/${stage.id}`
            : `/settings/pipelines/${pipelineId}/stages`;
        const method = stage ? patch : post;
        method(url, { onSuccess: () => { reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Stage name</label>
                    <input
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Viewing Scheduled"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {STAGE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Probability: {data.probability}%
                    </label>
                    <input
                        type="range" min="0" max="100"
                        value={data.probability}
                        onChange={(e) => setData('probability', parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex flex-wrap gap-1.5">
                        {STAGE_COLORS.map((c) => (
                            <button
                                key={c} type="button"
                                onClick={() => setData('color', c)}
                                className={`w-6 h-6 rounded-full border-2 ${data.color === c ? 'border-gray-900 scale-110' : 'border-transparent'} transition-transform`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <input
                            type="color"
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-gray-300"
                            title="Custom color"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <button
                    type="submit" disabled={processing}
                    className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {stage ? 'Save changes' : 'Add stage'}
                </button>
                <button type="button" onClick={onDone}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                    Cancel
                </button>
            </div>
        </form>
    );
}

function PipelineCard({ pipeline }) {
    const [stages, setStages] = useState(pipeline.stages ?? []);
    const [addingStage, setAddingStage] = useState(false);
    const [editingStage, setEditingStage] = useState(null);
    const [collapsed, setCollapsed] = useState(false);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name:      pipeline.name,
        is_active: pipeline.is_active,
    });

    function savePipeline() {
        patch(`/settings/pipelines/${pipeline.id}`, { preserveScroll: true });
    }

    function deletePipeline() {
        if (!confirm(`Delete pipeline "${pipeline.name}"?`)) return;
        router.delete(`/settings/pipelines/${pipeline.id}`, { preserveScroll: true });
    }

    function deleteStage(stage) {
        if (!confirm(`Delete stage "${stage.name}"?`)) return;
        router.delete(`/settings/pipelines/${pipeline.id}/stages/${stage.id}`, {
            preserveScroll: true,
            onSuccess: () => setStages((s) => s.filter((x) => x.id !== stage.id)),
        });
    }

    function handleReorder(newItems) {
        setStages(newItems);
        router.patch(
            `/settings/pipelines/${pipeline.id}/stages/reorder`,
            { stages: newItems.map((s) => s.id) },
            { preserveScroll: true }
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Pipeline header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <button onClick={() => setCollapsed(!collapsed)}
                    className="text-gray-400 hover:text-gray-600 text-xs">
                    {collapsed ? '▶' : '▼'}
                </button>
                <input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="flex-1 text-sm font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-0 py-0.5"
                />
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={data.is_active}
                        onChange={(e) => setData('is_active', e.target.checked)}
                        className="rounded accent-indigo-600"
                    />
                    Active
                </label>
                <button
                    onClick={savePipeline} disabled={processing}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    Save
                </button>
                <button
                    onClick={deletePipeline}
                    className="px-2 py-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                >
                    Delete
                </button>
            </div>

            {!collapsed && (
                <div className="px-5 py-4 space-y-3">
                    {/* Stage list */}
                    {stages.length > 0 && (
                        <SortableList
                            items={stages}
                            onReorder={handleReorder}
                            renderItem={(stage) => (
                                editingStage?.id === stage.id ? (
                                    <StageForm
                                        pipelineId={pipeline.id}
                                        stage={stage}
                                        onDone={() => {
                                            setEditingStage(null);
                                            router.reload({ only: ['pipelines'], preserveScroll: true });
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                        <span
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: stage.color }}
                                        />
                                        <span className="flex-1 text-sm text-gray-800">{stage.name}</span>
                                        <span className="text-xs text-gray-400">{stage.probability}%</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            stage.type === 'won'  ? 'bg-green-100 text-green-700' :
                                            stage.type === 'lost' ? 'bg-red-100 text-red-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {stage.type}
                                        </span>
                                        <button
                                            onClick={() => setEditingStage(stage)}
                                            className="text-xs text-gray-400 hover:text-indigo-600"
                                        >Edit</button>
                                        <button
                                            onClick={() => deleteStage(stage)}
                                            className="text-xs text-gray-400 hover:text-red-600"
                                        >×</button>
                                    </div>
                                )
                            )}
                        />
                    )}

                    {addingStage ? (
                        <StageForm
                            pipelineId={pipeline.id}
                            onDone={() => {
                                setAddingStage(false);
                                router.reload({ only: ['pipelines'], preserveScroll: true });
                            }}
                        />
                    ) : (
                        <button
                            onClick={() => setAddingStage(true)}
                            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            <span>+</span> Add stage
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function NewPipelineForm({ onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    function submit(e) {
        e.preventDefault();
        post('/settings/pipelines', { onSuccess: () => { reset(); onDone(); } });
    }

    return (
        <form onSubmit={submit} className="flex items-center gap-3 bg-white border border-indigo-300 rounded-xl px-4 py-3 shadow-sm">
            <input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="New pipeline name…"
                autoFocus
                className="flex-1 text-sm border-0 focus:outline-none bg-transparent"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            <button type="submit" disabled={processing}
                className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
                Create
            </button>
            <button type="button" onClick={onDone}
                className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </form>
    );
}

export default function PipelinesIndex({ pipelines }) {
    const [creating, setCreating] = useState(false);

    return (
        <AppLayout title="Pipelines">
            <div className="max-w-3xl space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Manage your sales and rental pipelines. Drag stages to reorder them.
                    </p>
                    {!creating && (
                        <button
                            onClick={() => setCreating(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                        >
                            + New pipeline
                        </button>
                    )}
                </div>

                {creating && <NewPipelineForm onDone={() => setCreating(false)} />}

                {pipelines.map((pipeline) => (
                    <PipelineCard key={pipeline.id} pipeline={pipeline} />
                ))}

                {pipelines.length === 0 && !creating && (
                    <div className="text-center py-16 text-gray-400 text-sm">
                        No pipelines yet. Create one to get started.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
