<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\ContactRole;
use App\Models\DocumentType;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $query = Contact::with('roles')
            ->withCount(['leads', 'deals'])
            ->latest();

        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('role', $request->role));
        }

        if ($request->filled('assigned')) {
            $query->where('assigned_to', $request->assigned);
        }

        $contacts = $query->paginate(25)->withQueryString()
            ->through(fn ($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'email'       => $c->email,
                'phone'       => $c->phone,
                'nationality' => $c->nationality,
                'roles'       => $c->roles->pluck('role'),
                'leads_count' => $c->leads_count,
                'deals_count' => $c->deals_count,
                'tags'        => $c->tags ?? [],
            ]);

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'agents'   => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'filters'  => $request->only(['search', 'role', 'assigned']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Contacts/Create', [
            'agents' => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateContact($request);
        $data['created_by'] = auth()->id();
        $data['tags'] = $request->input('tags', []);

        $contact = Contact::create($data);

        return redirect()->route('contacts.show', $contact)
            ->with('success', "{$contact->name} created.");
    }

    public function show(Contact $contact)
    {
        $contact->load([
            'roles',
            'assignedTo',
            'createdBy',
            'ownedProperties',
            'leads'  => fn ($q) => $q->latest()->limit(10),
            'deals'  => fn ($q) => $q->latest()->limit(10),
        ]);

        $tasks      = $contact->tasks()->with(['taskType', 'assignedTo'])->orderByRaw('status = "done" ASC')->orderByRaw('due_at IS NULL ASC')->orderBy('due_at')->get();
        $activities = $contact->activities()->with('user')->latest('created_at')->limit(50)->get();
        $documents  = $contact->documents()->with(['documentType', 'uploadedBy'])->latest()->get();
        $taskCtrl   = new \App\Http\Controllers\Crm\TaskController();
        $docCtrl    = new \App\Http\Controllers\Crm\DocumentController();

        return Inertia::render('Contacts/Show', [
            'contact' => [
                'id'            => $contact->id,
                'name'          => $contact->name,
                'first_name'    => $contact->first_name,
                'last_name'     => $contact->last_name,
                'email'         => $contact->email,
                'phone'         => $contact->phone,
                'phone_2'       => $contact->phone_2,
                'nationality'   => $contact->nationality,
                'id_type'       => $contact->id_type,
                'id_number'     => $contact->id_number,
                'address'       => $contact->address,
                'notes'         => $contact->notes,
                'tags'          => $contact->tags ?? [],
                'roles'         => $contact->roles->map(fn ($r) => [
                    'role'  => $r->role,
                    'notes' => $r->notes,
                ]),
                'assigned_to'   => $contact->assignedTo?->only('id', 'name'),
                'created_by'    => $contact->createdBy?->only('id', 'name'),
                'created_at'    => $contact->created_at->toDateString(),
                'owned_properties' => $contact->ownedProperties->map(fn ($p) => [
                    'id'        => $p->id,
                    'reference' => $p->reference,
                    'title'     => $p->title,
                    'status'    => $p->status,
                    'pivot'     => $p->pivot->only(['ownership_pct', 'is_primary']),
                ]),
                'leads'  => $contact->leads->map(fn ($l) => [
                    'id'        => $l->id,
                    'reference' => $l->reference,
                    'status'    => $l->status,
                    'purpose'   => $l->purpose,
                    'created_at'=> $l->created_at->toDateString(),
                ]),
                'deals'  => $contact->deals->map(fn ($d) => [
                    'id'        => $d->id,
                    'reference' => $d->reference,
                    'title'     => $d->title,
                    'status'    => $d->status,
                    'value'     => $d->value,
                ]),
            ],
            'taskTypes' => TaskType::where('is_active', true)->orderBy('position')->get(['id', 'name', 'icon']),
            'tasks'     => $tasks->map(fn ($t) => $taskCtrl->transform($t)),
            'activities' => $activities->map(fn ($a) => [
                'id'          => $a->id,
                'action'      => $a->action,
                'description' => $a->description,
                'user'        => $a->user ? ['id' => $a->user->id, 'name' => $a->user->name] : null,
                'created_at'  => $a->created_at->diffForHumans(),
            ]),
            'agents'        => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'subject'       => ['type' => 'contact', 'id' => $contact->id],
            'documents'     => $documents->map(fn ($d) => $docCtrl->transform($d)),
            'documentTypes' => DocumentType::where('is_active', true)->orderBy('position')->get(['id', 'name']),
        ]);
    }

    public function edit(Contact $contact)
    {
        return Inertia::render('Contacts/Edit', [
            'contact' => $contact->only([
                'id', 'first_name', 'last_name', 'email', 'phone', 'phone_2',
                'nationality', 'id_type', 'id_number', 'address', 'notes', 'tags', 'assigned_to',
            ]),
            'agents'  => User::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Contact $contact)
    {
        $data = $this->validateContact($request, $contact->id);
        $data['tags'] = $request->input('tags', []);
        $contact->update($data);

        return redirect()->route('contacts.show', $contact)
            ->with('success', 'Contact updated.');
    }

    public function destroy(Contact $contact)
    {
        $name = $contact->name;
        $contact->delete();

        return redirect()->route('contacts.index')
            ->with('success', "{$name} deleted.");
    }

    // ── Roles ─────────────────────────────────────────────────────────────────

    public function storeRole(Request $request, Contact $contact)
    {
        $data = $request->validate([
            'role'  => 'required|in:buyer,tenant,owner',
            'notes' => 'nullable|string|max:500',
        ]);

        $contact->roles()->firstOrCreate(
            ['role' => $data['role']],
            ['notes' => $data['notes'] ?? null, 'created_at' => now()]
        );

        return back()->with('success', ucfirst($data['role']) . ' role added.');
    }

    public function destroyRole(Contact $contact, string $role)
    {
        $contact->roles()->where('role', $role)->delete();

        return back()->with('success', 'Role removed.');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function validateContact(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'first_name'  => 'required|string|max:100',
            'last_name'   => 'required|string|max:100',
            'email'       => 'nullable|email|max:200',
            'phone'       => 'nullable|string|max:30',
            'phone_2'     => 'nullable|string|max:30',
            'nationality' => 'nullable|string|max:100',
            'id_type'     => 'nullable|in:passport,emirates_id,national_id,other',
            'id_number'   => 'nullable|string|max:100',
            'address'     => 'nullable|string|max:500',
            'notes'       => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);
    }
}
