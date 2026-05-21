<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Lead;
use App\Models\LeadSource;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;

class ImportController extends Controller
{
    // ── Pages ─────────────────────────────────────────────────────────────────

    public function contactsPage()
    {
        return Inertia::render('Contacts/Import');
    }

    public function leadsPage()
    {
        $sources = LeadSource::where('is_active', true)->orderBy('position')->get(['id', 'name']);
        return Inertia::render('Leads/Import', ['sources' => $sources]);
    }

    // ── Sample CSV downloads ───────────────────────────────────────────────────

    public function sample(string $type)
    {
        $samples = [
            'contacts' => [
                ['first_name', 'last_name', 'email', 'phone', 'nationality', 'notes'],
                ['Jean', 'Uwimana', 'jean@example.com', '+250781000001', 'Rwandan', 'VIP client'],
                ['Alice', 'Kamana', 'alice@example.com', '+250782000002', 'Rwandan', ''],
            ],
            'leads' => [
                ['first_name', 'last_name', 'email', 'phone', 'purpose', 'budget_min', 'budget_max', 'bedrooms_wanted', 'message'],
                ['Jean', 'Uwimana', 'jean@example.com', '+250781000001', 'buy', '30000000', '80000000', '3', 'Looking for family home in Kigali'],
                ['Alice', 'Kamana', '', '+250782000002', 'rent', '', '5000000', '2', ''],
            ],
        ];

        if (!isset($samples[$type])) abort(404);

        $rows    = $samples[$type];
        $headers = array_shift($rows);
        $csv     = implode(',', $headers) . "\n";
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(fn ($v) => '"' . str_replace('"', '""', $v) . '"', $row)) . "\n";
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$type}-sample.csv\"",
        ]);
    }

    // ── Contacts import ────────────────────────────────────────────────────────

    public function contactsImport(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);

        $rows      = $this->parseCsv($request->file('file'));
        $companyId = auth()->user()->company_id;

        $imported = 0;
        $skipped  = 0;
        $errors   = [];

        foreach ($rows as $i => $row) {
            $n         = $i + 2;
            $firstName = trim($row['first_name'] ?? '');
            $email     = strtolower(trim($row['email'] ?? ''));
            $phone     = trim($row['phone'] ?? '');

            if (empty($firstName)) {
                $errors[] = "Row {$n}: first_name is required";
                continue;
            }

            // Duplicate check
            $q = Contact::where('company_id', $companyId);
            if ($email || $phone) {
                $q->where(function ($q) use ($email, $phone) {
                    if ($email) $q->orWhere('email', $email);
                    if ($phone) $q->orWhere('phone', $phone);
                });
                if ($q->exists()) { $skipped++; continue; }
            }

            Contact::create([
                'company_id'  => $companyId,
                'first_name'  => $firstName,
                'last_name'   => trim($row['last_name'] ?? ''),
                'email'       => $email ?: null,
                'phone'       => $phone ?: null,
                'nationality' => trim($row['nationality'] ?? '') ?: null,
                'notes'       => trim($row['notes'] ?? '') ?: null,
                'created_by'  => auth()->id(),
            ]);
            $imported++;
        }

        $msg = "Imported {$imported} contact" . ($imported !== 1 ? 's' : '') . ".";
        if ($skipped)       $msg .= " {$skipped} duplicate" . ($skipped !== 1 ? 's' : '') . " skipped.";
        if (count($errors)) $msg .= " " . count($errors) . " row" . (count($errors) !== 1 ? 's' : '') . " had errors.";

        return redirect('/contacts/import')->with('import_success', $msg)->with('import_errors', $errors);
    }

    // ── Leads import ──────────────────────────────────────────────────────────

    public function leadsImport(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);

        $rows      = $this->parseCsv($request->file('file'));
        $companyId = auth()->user()->company_id;
        $sourceId  = LeadSource::where('company_id', $companyId)
            ->where(fn ($q) => $q->where('slug', 'import')->orWhere('name', 'Import'))
            ->value('id');

        $imported = 0;
        $skipped  = 0;
        $errors   = [];

        foreach ($rows as $i => $row) {
            $n         = $i + 2;
            $firstName = trim($row['first_name'] ?? '');
            $email     = strtolower(trim($row['email'] ?? ''));
            $phone     = trim($row['phone'] ?? '');

            if (empty($firstName)) {
                $errors[] = "Row {$n}: first_name is required";
                continue;
            }

            // Find or create contact
            $contact = null;
            if ($email) $contact = Contact::where('company_id', $companyId)->where('email', $email)->first();
            if (!$contact && $phone) $contact = Contact::where('company_id', $companyId)->where('phone', $phone)->first();
            if (!$contact) {
                $contact = Contact::create([
                    'company_id' => $companyId,
                    'first_name' => $firstName,
                    'last_name'  => trim($row['last_name'] ?? ''),
                    'email'      => $email ?: null,
                    'phone'      => $phone ?: null,
                    'created_by' => auth()->id(),
                ]);
            }

            // Duplicate lead check (same contact + purpose)
            $purpose = in_array($row['purpose'] ?? '', ['buy', 'rent', 'sale']) ? $row['purpose'] : 'buy';
            $alreadyHasLead = Lead::where('company_id', $companyId)
                ->where('contact_id', $contact->id)
                ->where('status', '!=', 'lost')
                ->exists();

            if ($alreadyHasLead) { $skipped++; continue; }

            Lead::create([
                'company_id'      => $companyId,
                'contact_id'      => $contact->id,
                'lead_source_id'  => $sourceId,
                'source_detail'   => 'CSV import',
                'purpose'         => $purpose === 'sale' ? 'buy' : $purpose,
                'budget_min'      => is_numeric($row['budget_min'] ?? '') ? (int) $row['budget_min'] : null,
                'budget_max'      => is_numeric($row['budget_max'] ?? '') ? (int) $row['budget_max'] : null,
                'bedrooms_wanted' => is_numeric($row['bedrooms_wanted'] ?? '') ? (int) $row['bedrooms_wanted'] : null,
                'message'         => trim($row['message'] ?? '') ?: null,
                'status'          => 'new',
            ]);
            $imported++;
        }

        $msg = "Imported {$imported} lead" . ($imported !== 1 ? 's' : '') . ".";
        if ($skipped)       $msg .= " {$skipped} duplicate" . ($skipped !== 1 ? 's' : '') . " skipped.";
        if (count($errors)) $msg .= " " . count($errors) . " row" . (count($errors) !== 1 ? 's' : '') . " had errors.";

        return redirect('/leads/import')->with('import_success', $msg)->with('import_errors', $errors);
    }

    // ── CSV parser ────────────────────────────────────────────────────────────

    private function parseCsv(UploadedFile $file): array
    {
        $path    = $file->getRealPath();
        $content = file_get_contents($path);
        // Strip UTF-8 BOM
        $content = ltrim($content, "\xEF\xBB\xBF");
        // Normalise line endings
        $content = str_replace(["\r\n", "\r"], "\n", $content);
        file_put_contents($path, $content);

        $rows    = [];
        $handle  = fopen($path, 'r');
        $headers = null;

        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            $row = array_map('trim', $row);
            if ($headers === null) {
                $headers = array_map('strtolower', $row);
                continue;
            }
            if (count($row) >= count($headers)) {
                $rows[] = array_combine($headers, array_slice($row, 0, count($headers)));
            }
        }

        fclose($handle);
        return $rows;
    }
}
