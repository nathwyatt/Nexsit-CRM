<?php

namespace App\Http\Controllers\Crm;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Document;
use App\Models\DocumentType;
use App\Models\Lead;
use App\Models\Property;
use App\Models\Tenancy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    private array $morphMap = [
        'lead'     => Lead::class,
        'deal'     => Deal::class,
        'contact'  => Contact::class,
        'property' => Property::class,
        'tenancy'  => Tenancy::class,
    ];

    public function index(Request $request)
    {
        $query = Document::with(['documentType', 'uploadedBy'])->latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->filled('type')) {
            $query->where('document_type_id', $request->type);
        }
        if ($request->filled('entity')) {
            $query->where('documentable_type', $request->entity);
        }

        $documents = $query->paginate(30)->withQueryString()
            ->through(fn ($d) => $this->transform($d));

        return Inertia::render('Documents/Index', [
            'documents'     => $documents,
            'documentTypes' => DocumentType::where('is_active', true)->orderBy('position')->get(['id', 'name']),
            'filters'       => $request->only(['search', 'type', 'entity']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file'               => 'required|file|max:51200',
            'documentable_type'  => 'required|in:lead,deal,contact,property,tenancy',
            'documentable_id'    => 'required|integer',
            'document_type_id'   => 'nullable|exists:document_types,id',
            'expires_at'         => 'nullable|date',
            'notes'              => 'nullable|string|max:1000',
        ]);

        $file      = $request->file('file');
        $morphType = $request->documentable_type;
        $modelClass = $this->morphMap[$morphType];
        $model     = $modelClass::findOrFail($request->documentable_id);

        $path = $file->store("documents/{$morphType}/{$model->id}", 'local');

        Document::create([
            'document_type_id'  => $request->document_type_id,
            'name'              => $request->input('name', $file->getClientOriginalName()),
            'disk'              => 'local',
            'path'              => $path,
            'size'              => $file->getSize(),
            'mime_type'         => $file->getMimeType(),
            'uploaded_by'       => auth()->id(),
            'documentable_id'   => $model->id,
            'documentable_type' => $morphType,
            'expires_at'        => $request->expires_at,
            'notes'             => $request->notes,
        ]);

        return back()->with('success', 'Document uploaded.');
    }

    public function download(Document $document)
    {
        abort_unless(Storage::disk($document->disk)->exists($document->path), 404);

        return Storage::disk($document->disk)->download($document->path, $document->name);
    }

    public function destroy(Document $document)
    {
        Storage::disk($document->disk)->delete($document->path);
        $document->delete();

        return back()->with('success', 'Document deleted.');
    }

    public function transform(Document $d): array
    {
        return [
            'id'            => $d->id,
            'name'          => $d->name,
            'mime_type'     => $d->mime_type,
            'size'          => $d->humanSize(),
            'expires_at'    => $d->expires_at?->toDateString(),
            'is_expired'    => $d->isExpired(),
            'expiring_soon' => $d->isExpiringSoon(),
            'notes'         => $d->notes,
            'uploaded_by'   => $d->uploadedBy?->only('id', 'name'),
            'created_at'    => $d->created_at->toDateString(),
            'document_type' => $d->documentType?->only('id', 'name'),
            'download_url'  => route('documents.download', $d),
        ];
    }
}
