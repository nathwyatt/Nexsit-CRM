<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Deal;
use App\Models\Lead;
use App\Models\Tenancy;
use App\Models\WhatsappTemplate;
use App\Services\ActivityLogger;
use App\Services\WhatsappService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappController extends Controller
{
    public function index()
    {
        $templates = WhatsappTemplate::orderBy('module')->orderBy('name')->get();

        return Inertia::render('Settings/Whatsapp/Index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'   => 'required|string|max:100',
            'module' => 'required|in:lead,contact,deal,tenancy,general',
            'body'   => 'required|string|max:1000',
        ]);

        WhatsappTemplate::create([
            'company_id' => auth()->user()->company_id,
            ...$data,
        ]);

        return back()->with('success', 'Template created.');
    }

    public function update(Request $request, WhatsappTemplate $whatsappTemplate)
    {
        $data = $request->validate([
            'name'      => 'sometimes|string|max:100',
            'module'    => 'sometimes|in:lead,contact,deal,tenancy,general',
            'body'      => 'sometimes|string|max:1000',
            'is_active' => 'sometimes|boolean',
        ]);

        $whatsappTemplate->update($data);

        return back()->with('success', 'Template updated.');
    }

    public function destroy(WhatsappTemplate $whatsappTemplate)
    {
        $whatsappTemplate->delete();
        return back()->with('success', 'Template deleted.');
    }

    public function compose(Request $request)
    {
        $data = $request->validate([
            'module'      => 'required|in:lead,contact,deal,tenancy',
            'model_id'    => 'required|integer',
            'template_id' => 'nullable|exists:whatsapp_templates,id',
            'phone'       => 'required|string|max:30',
        ]);

        $subject = match ($data['module']) {
            'lead'    => Lead::with('contact')->find($data['model_id']),
            'contact' => Contact::find($data['model_id']),
            'deal'    => Deal::find($data['model_id']),
            'tenancy' => Tenancy::with('property')->find($data['model_id']),
        };

        abort_unless($subject && $subject->company_id === auth()->user()->company_id, 404);

        $message = '';

        if ($data['template_id']) {
            $template = WhatsappTemplate::find($data['template_id']);
            if ($template) {
                $vars    = WhatsappService::varsFor($data['module'], $subject);
                $message = WhatsappService::interpolate($template->body, $vars);
            }
        }

        $url = WhatsappService::makeLink($data['phone'], $message);

        ActivityLogger::log(
            $subject,
            'whatsapp_sent',
            'WhatsApp message opened' . ($data['template_id'] ? ' via template' : '')
        );

        return response()->json(['url' => $url, 'message' => $message]);
    }
}
