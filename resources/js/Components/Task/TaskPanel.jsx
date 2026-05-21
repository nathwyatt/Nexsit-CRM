import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

const PRIORITY_STYLES = {
    low:    'bg-gray-100 text-gray-600',
    medium: 'bg-amber-100 text-amber-700',
    high:   'bg-red-100 text-red-700',
};

function TaskRow({ task, onComplete, onDelete }) {
    const isDone    = task.status === 'done';
    const isOverdue = task.is_overdue;

    return (
        <div className={`flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 group ${isDone ? 'opacity-50' : ''}`}>
            <button
                onClick={() => !isDone && onComplete(task.id)}
                className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                    isDone
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-indigo-500'
                }`}
                title={isDone ? 'Done' : 'Mark complete'}
            >
                {isDone && <span className="text-xs leading-none">✓</span>}
            </button>

            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-gray-900 truncate ${isDone ? 'line-through' : ''}`}>
                    {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {task.task_type && (
                        <span className="text-xs text-gray-400">{task.task_type.name}</span>
                    )}
                    {task.due_at && (
                        <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                            {isOverdue ? 'Overdue · ' : ''}{task.due_at_human}
                        </span>
                    )}
                    {task.assigned_to && (
                        <span className="text-xs text-gray-400">{task.assigned_to.name}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}>
                    {task.priority}
                </span>
                <button
                    onClick={() => onDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-sm leading-none"
                    title="Delete"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

export default function TaskPanel({ tasks = [], taskTypes = [], agents = [], subject }) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title:         '',
        task_type_id:  taskTypes[0]?.id ?? '',
        description:   '',
        due_at:        '',
        priority:      'medium',
        assigned_to:   '',
        taskable_type: subject.type,
        taskable_id:   subject.id,
    });

    function submit(e) {
        e.preventDefault();
        post('/tasks', {
            preserveScroll: true,
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    function complete(id) {
        router.patch(`/tasks/${id}/complete`, {}, { preserveScroll: true });
    }

    function deleteTask(id) {
        if (!confirm('Delete this task?')) return;
        router.delete(`/tasks/${id}`, { preserveScroll: true });
    }

    const pending = tasks.filter(t => t.status !== 'done');
    const done    = tasks.filter(t => t.status === 'done');

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Tasks {pending.length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold">{pending.length}</span>}
                </h3>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    {showForm ? 'Cancel' : '+ Add task'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="mb-4 space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div>
                        <input
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            placeholder="Task title *"
                            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {taskTypes.length > 0 && (
                            <div>
                                <select value={data.task_type_id} onChange={e => setData('task_type_id', e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">— Type —</option>
                                    {taskTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <select value={data.priority} onChange={e => setData('priority', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="low">Low priority</option>
                                <option value="medium">Medium priority</option>
                                <option value="high">High priority</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <input type="datetime-local" value={data.due_at} onChange={e => setData('due_at', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <select value={data.assigned_to} onChange={e => setData('assigned_to', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">— Assign to me —</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium">
                        {processing ? 'Creating…' : 'Create task'}
                    </button>
                </form>
            )}

            {tasks.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">No tasks yet.</p>
            ) : (
                <div>
                    {pending.map(t => (
                        <TaskRow key={t.id} task={t} onComplete={complete} onDelete={deleteTask} />
                    ))}
                    {done.length > 0 && (
                        <details className="mt-2">
                            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                                {done.length} completed
                            </summary>
                            <div className="mt-1">
                                {done.map(t => (
                                    <TaskRow key={t.id} task={t} onComplete={complete} onDelete={deleteTask} />
                                ))}
                            </div>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
}
