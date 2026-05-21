import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const PRIORITY_STYLES = {
    low:    'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high:   'bg-red-100 text-red-700',
};

const MORPH_LINKS = {
    lead:     id => `/leads/${id}`,
    deal:     id => `/deals/${id}`,
    contact:  id => `/contacts/${id}`,
    property: id => `/properties/${id}`,
};

function TaskCard({ task, onComplete, onDelete }) {
    const isDone    = task.status === 'done';
    const isOverdue = task.is_overdue;
    const link      = task.taskable_type ? MORPH_LINKS[task.taskable_type]?.(task.taskable_id) : null;

    return (
        <div className={`bg-white rounded-lg border shadow-sm p-4 flex gap-3 group transition-opacity ${isDone ? 'opacity-50' : ''} ${isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
            <button
                onClick={() => !isDone && onComplete(task.id)}
                className={`mt-0.5 w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    isDone ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-indigo-500'
                }`}
            >
                {isDone && <span className="text-xs leading-none">✓</span>}
            </button>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-gray-900 ${isDone ? 'line-through' : ''}`}>{task.title}</p>
                {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                    </span>
                    {task.task_type && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{task.task_type.name}</span>
                    )}
                    {task.due_at && (
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-400'}`}>
                            {isOverdue ? '⚠ ' : ''}Due {task.due_at_human}
                        </span>
                    )}
                    {task.assigned_to && (
                        <span className="text-xs text-gray-400">→ {task.assigned_to.name}</span>
                    )}
                    {link && (
                        <a href={link} className="text-xs text-indigo-500 hover:text-indigo-700 capitalize">
                            {task.taskable_type} #{task.taskable_id} →
                        </a>
                    )}
                </div>
            </div>

            <button
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0 self-start text-lg leading-none"
                title="Delete"
            >
                ×
            </button>
        </div>
    );
}

function CreateTaskModal({ taskTypes, agents, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title:        '',
        task_type_id: taskTypes[0]?.id ?? '',
        description:  '',
        due_at:       '',
        priority:     'medium',
        assigned_to:  '',
        taskable_type: '',
        taskable_id:   '',
    });

    function submit(e) {
        e.preventDefault();
        post('/tasks', {
            preserveScroll: true,
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">New Task</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>
                <form onSubmit={submit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                        <input value={data.title} onChange={e => setData('title', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="What needs to be done?" />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {taskTypes.length > 0 && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                <select value={data.task_type_id} onChange={e => setData('task_type_id', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">— None —</option>
                                    {taskTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                            <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Due date</label>
                            <input type="datetime-local" value={data.due_at} onChange={e => setData('due_at', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Assign to</label>
                            <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">— Myself —</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows={3} value={data.description} onChange={e => setData('description', e.target.value)}
                            placeholder="Optional details…"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                            {processing ? 'Creating…' : 'Create task'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Section({ title, tasks, badge, onComplete, onDelete }) {
    if (tasks.length === 0) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
                {badge && (
                    <span className="px-1.5 py-0.5 text-xs rounded font-bold bg-red-100 text-red-700">{tasks.length}</span>
                )}
            </div>
            {tasks.map(t => (
                <TaskCard key={t.id} task={t} onComplete={onComplete} onDelete={onDelete} />
            ))}
        </div>
    );
}

export default function TasksIndex({ myTasks, teamTasks, overdue, taskTypes, agents }) {
    const [showCreate, setShowCreate] = useState(false);
    const [tab, setTab]               = useState('mine');

    function complete(id) {
        router.patch(`/tasks/${id}/complete`, {}, { preserveScroll: true });
    }

    function deleteTask(id) {
        if (!confirm('Delete this task?')) return;
        router.delete(`/tasks/${id}`, { preserveScroll: true });
    }

    const tabs = [
        { key: 'mine', label: `My Tasks (${myTasks.length})` },
        { key: 'team', label: `Team (${teamTasks.length})` },
        { key: 'overdue', label: `Overdue (${overdue.length})` },
    ];

    const visibleTasks = tab === 'mine' ? myTasks : tab === 'team' ? teamTasks : overdue;

    return (
        <AppLayout title="Tasks">
            <div className="max-w-3xl space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        + New task
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                                tab === t.key
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Task list */}
                {visibleTasks.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                        <p className="text-gray-400 text-sm">No tasks here.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {visibleTasks.map(t => (
                            <TaskCard key={t.id} task={t} onComplete={complete} onDelete={deleteTask} />
                        ))}
                    </div>
                )}
            </div>

            {showCreate && (
                <CreateTaskModal
                    taskTypes={taskTypes}
                    agents={agents}
                    onClose={() => setShowCreate(false)}
                />
            )}
        </AppLayout>
    );
}
