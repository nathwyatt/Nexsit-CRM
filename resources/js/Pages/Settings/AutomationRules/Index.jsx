import { useState } from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

const CONDITION_FIELDS = [
    { value: 'status',           label: 'Status' },
    { value: 'priority',         label: 'Priority' },
    { value: 'purpose',          label: 'Purpose' },
    { value: 'budget_max',       label: 'Budget Max' },
    { value: 'assigned_to',      label: 'Assigned To (ID)' },
    { value: 'contact_id',       label: 'Contact ID' },
];

const OPERATORS = [
    { value: 'equals',       label: '=' },
    { value: 'not_equals',   label: '≠' },
    { value: 'contains',     label: 'contains' },
    { value: 'greater_than', label: '>' },
    { value: 'less_than',    label: '<' },
];

const ACTION_TYPES = [
    { value: 'create_task', label: 'Create Task' },
    { value: 'assign_to',   label: 'Assign To' },
];

const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

function emptyCondition() {
    return { field: 'status', operator: 'equals', value: '' };
}

function emptyAction() {
    return { type: 'create_task', title: '', priority: 'normal', due_days: '', assigned_to: '' };
}

function RuleForm({ rule = null, triggers, agents, onSave, onCancel }) {
    const [name, setName]         = useState(rule?.name ?? '');
    const [desc, setDesc]         = useState(rule?.description ?? '');
    const [trigger, setTrigger]   = useState(rule?.trigger ?? triggers[0]?.value ?? '');
    const [isActive, setIsActive] = useState(rule?.is_active ?? true);
    const [conditions, setConds]  = useState(rule?.conditions?.length ? rule.conditions : []);
    const [actions, setActions]   = useState(rule?.actions?.length ? rule.actions : [emptyAction()]);
    const [errors, setErrors]     = useState({});

    function addCondition() { setConds(c => [...c, emptyCondition()]); }
    function removeCondition(i) { setConds(c => c.filter((_, idx) => idx !== i)); }
    function updateCondition(i, key, val) {
        setConds(c => c.map((cond, idx) => idx === i ? { ...cond, [key]: val } : cond));
    }

    function addAction() { setActions(a => [...a, emptyAction()]); }
    function removeAction(i) { setActions(a => a.filter((_, idx) => idx !== i)); }
    function updateAction(i, key, val) {
        setActions(a => a.map((act, idx) => idx === i ? { ...act, [key]: val } : act));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) { setErrors({ name: 'Name is required' }); return; }
        if (!actions.length) { setErrors({ actions: 'Add at least one action' }); return; }

        onSave({ name, description: desc, trigger, is_active: isActive, conditions, actions });
    }

    const inp = 'border border-gray-300 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
    const sel = inp + ' bg-white';

    return (
        <form onSubmit={handleSubmit} className="space-y-5 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Rule Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Create follow-up task on new lead"
                        className={inp + ' w-full'} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Trigger *</label>
                    <select value={trigger} onChange={e => setTrigger(e.target.value)} className={sel + ' w-full'}>
                        {triggers.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional description"
                    className={inp + ' w-full'} />
            </div>

            <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                    className="rounded text-indigo-600" />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active (rule will fire automatically)</label>
            </div>

            {/* Conditions */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Conditions (all must match)</span>
                    <button type="button" onClick={addCondition}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add condition</button>
                </div>
                {conditions.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No conditions — rule fires on every trigger event.</p>
                )}
                <div className="space-y-2">
                    {conditions.map((cond, i) => (
                        <div key={i} className="flex items-center gap-2 flex-wrap">
                            <select value={cond.field} onChange={e => updateCondition(i, 'field', e.target.value)}
                                className={sel}>
                                {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                            <select value={cond.operator} onChange={e => updateCondition(i, 'operator', e.target.value)}
                                className={sel}>
                                {OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                            </select>
                            <input value={cond.value} onChange={e => updateCondition(i, 'value', e.target.value)}
                                placeholder="value" className={inp + ' w-32'} />
                            <button type="button" onClick={() => removeCondition(i)}
                                className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions *</span>
                    <button type="button" onClick={addAction}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add action</button>
                </div>
                {errors.actions && <p className="text-red-500 text-xs mb-2">{errors.actions}</p>}
                <div className="space-y-3">
                    {actions.map((act, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <select value={act.type} onChange={e => updateAction(i, 'type', e.target.value)}
                                    className={sel}>
                                    {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                {actions.length > 1 && (
                                    <button type="button" onClick={() => removeAction(i)}
                                        className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                                )}
                            </div>
                            {act.type === 'create_task' && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <input value={act.title ?? ''} onChange={e => updateAction(i, 'title', e.target.value)}
                                        placeholder="Task title" className={inp + ' col-span-2'} />
                                    <select value={act.priority ?? 'normal'} onChange={e => updateAction(i, 'priority', e.target.value)}
                                        className={sel}>
                                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <input type="number" min="0" value={act.due_days ?? ''} onChange={e => updateAction(i, 'due_days', e.target.value)}
                                        placeholder="Due in days" className={inp} />
                                </div>
                            )}
                            {act.type === 'assign_to' && (
                                <select value={act.user_id ?? ''} onChange={e => updateAction(i, 'user_id', e.target.value)}
                                    className={sel + ' w-full'}>
                                    <option value="">Select agent...</option>
                                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                    {rule ? 'Update Rule' : 'Create Rule'}
                </button>
                <button type="button" onClick={onCancel}
                    className="px-5 py-2 bg-white text-gray-700 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                    Cancel
                </button>
            </div>
        </form>
    );
}

function RuleRow({ rule, onEdit, onToggle, onDelete }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">{rule.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                        {rule.trigger_label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        rule.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                {rule.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{rule.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                    {rule.run_count} run{rule.run_count !== 1 ? 's' : ''}
                    {rule.last_run_at && ` · Last run ${rule.last_run_at}`}
                    {rule.created_by && ` · Created by ${rule.created_by.name}`}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button onClick={onToggle}
                    className={`text-xs px-3 py-1 rounded-md font-medium border ${
                        rule.is_active
                            ? 'text-gray-600 border-gray-300 hover:bg-gray-50'
                            : 'text-green-600 border-green-300 hover:bg-green-50'
                    }`}>
                    {rule.is_active ? 'Disable' : 'Enable'}
                </button>
                <button onClick={onEdit}
                    className="text-xs px-3 py-1 rounded-md font-medium border border-gray-300 text-gray-600 hover:bg-gray-50">
                    Edit
                </button>
                <button onClick={onDelete}
                    className="text-xs px-3 py-1 rounded-md font-medium border border-red-200 text-red-500 hover:bg-red-50">
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function AutomationRulesIndex({ rules, triggers, agents }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing]   = useState(null);

    function handleSave(data) {
        if (editing) {
            router.patch(`/settings/automation-rules/${editing.id}`, data, {
                onSuccess: () => setEditing(null),
            });
        } else {
            router.post('/settings/automation-rules', data, {
                onSuccess: () => setShowForm(false),
            });
        }
    }

    function handleDelete(rule) {
        if (!confirm(`Delete rule "${rule.name}"?`)) return;
        router.delete(`/settings/automation-rules/${rule.id}`);
    }

    function handleToggle(rule) {
        router.patch(`/settings/automation-rules/${rule.id}/toggle`);
    }

    return (
        <AppLayout title="Automation Rules">
            <div className="max-w-4xl space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Automation Rules</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Auto-create tasks and assign records when events happen</p>
                    </div>
                    {!showForm && !editing && (
                        <button onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 font-medium">
                            New Rule
                        </button>
                    )}
                </div>

                {(showForm && !editing) && (
                    <RuleForm
                        triggers={triggers}
                        agents={agents}
                        onSave={handleSave}
                        onCancel={() => setShowForm(false)}
                    />
                )}

                {rules.length === 0 && !showForm && (
                    <div className="text-center py-16 text-gray-300">
                        <p className="text-3xl mb-2">⚡</p>
                        <p className="text-sm">No automation rules yet.</p>
                        <p className="text-xs mt-1">Create rules to automate tasks and assignments when events happen.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {rules.map(rule => (
                        editing?.id === rule.id ? (
                            <RuleForm
                                key={rule.id}
                                rule={editing}
                                triggers={triggers}
                                agents={agents}
                                onSave={handleSave}
                                onCancel={() => setEditing(null)}
                            />
                        ) : (
                            <RuleRow
                                key={rule.id}
                                rule={rule}
                                onEdit={() => { setShowForm(false); setEditing(rule); }}
                                onToggle={() => handleToggle(rule)}
                                onDelete={() => handleDelete(rule)}
                            />
                        )
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
