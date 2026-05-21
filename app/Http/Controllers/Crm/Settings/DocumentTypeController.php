<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/DocumentTypes/Index', [
            'types' => DocumentType::orderBy('position')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:100|unique:document_types,name',
            'requires_expiry' => 'boolean',
            'is_active'       => 'boolean',
        ]);

        $data['position'] = DocumentType::max('position') + 1;

        DocumentType::create($data);

        return back()->with('success', 'Document type created.');
    }

    public function update(Request $request, DocumentType $documentType)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:100|unique:document_types,name,' . $documentType->id,
            'requires_expiry' => 'boolean',
            'is_active'       => 'boolean',
        ]);

        $documentType->update($data);

        return back()->with('success', 'Document type updated.');
    }

    public function destroy(DocumentType $documentType)
    {
        if ($documentType->documents()->exists()) {
            return back()->withErrors(['document_type' => 'Cannot delete a type that has documents.']);
        }

        $documentType->delete();

        return back()->with('success', 'Document type deleted.');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items'   => 'required|array',
            'items.*' => 'integer|exists:document_types,id',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $position => $id) {
                DocumentType::where('id', $id)->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Order saved.');
    }
}
