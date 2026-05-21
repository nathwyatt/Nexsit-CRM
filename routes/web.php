<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\User;
use App\Http\Controllers\Crm\LeadController;
use App\Http\Controllers\Crm\DealController;
use App\Http\Controllers\Crm\ContactController;
use App\Http\Controllers\Crm\PropertyController;
use App\Http\Controllers\Crm\Settings\PipelineController;
use App\Http\Controllers\Crm\Settings\PipelineStageController;
use App\Http\Controllers\Crm\Settings\LeadSourceController;
use App\Http\Controllers\Crm\Settings\PropertyTypeController;
use App\Http\Controllers\Crm\Settings\AmenityController;
use App\Http\Controllers\Crm\Settings\TaskTypeController;
use App\Http\Controllers\Crm\Settings\DocumentTypeController;
use App\Http\Controllers\Crm\Settings\AutomationRuleController;
use App\Http\Controllers\Crm\Settings\UserController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\PdfController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\Crm\Settings\EmailLogController;
use App\Http\Controllers\Crm\Settings\WhatsappController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\Crm\ViewingController;
use App\Http\Controllers\Crm\PropertyMatchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Crm\TaskController;
use App\Http\Controllers\PublicListingController;
use App\Http\Controllers\Crm\TenancyController;
use App\Http\Controllers\Crm\DocumentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SuperAdmin\DashboardController as SADashboard;
use App\Http\Controllers\SuperAdmin\CompanyController as SACompany;
use App\Http\Controllers\SuperAdmin\PlanController as SAPlan;

// Redirect root to dashboard or login
Route::get('/', fn () => redirect('/dashboard'));

// ── Public listing pages (no auth required) ─────────────────────────────────
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/listings', [PublicListingController::class, 'index'])->name('listings.index');
    Route::get('/listings/{reference}', [PublicListingController::class, 'show'])->name('listings.show');
    Route::post('/listings/{reference}/enquire', [PublicListingController::class, 'enquire'])
        ->middleware('throttle:10,1')
        ->name('listings.enquire');
});

// ── Auth ────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', fn () => Inertia::render('Auth/Login'))->name('login');

    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (auth()->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = auth()->user();
            $user->update(['last_login_at' => now()]);
            // Super admins go to their own panel
            if ($user->is_super_admin) {
                return redirect('/superadmin');
            }
            return redirect()->intended('/dashboard');
        }

        return back()->withErrors(['email' => 'These credentials do not match our records.']);
    });

    Route::get('/forgot-password', fn () => Inertia::render('Auth/ForgotPassword', [
        'status' => session('status'),
    ]))->name('password.request');

    Route::post('/forgot-password', function (Request $request) {
        $request->validate(['email' => 'required|email']);
        $status = Password::sendResetLink($request->only('email'));
        return back()->with('status', __($status));
    })->name('password.email');

    Route::get('/reset-password/{token}', function (string $token, Request $request) {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->email,
        ]);
    })->name('password.reset');

    Route::post('/reset-password', function (Request $request) {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => bcrypt($password)])
                     ->setRememberToken(Str::random(60));
                $user->save();
                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect('/login')->with('status', __($status));
        }

        return back()->withErrors(['email' => __($status)]);
    })->name('password.update');
});

Route::middleware(['auth', 'check_subscription'])->group(function () {
    Route::post('/logout', function (Request $request) {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    })->name('logout');

    Route::get('/subscription-expired', fn () => Inertia::render('Auth/SubscriptionExpired', [
        'user' => auth()->user()->only('name', 'email'),
    ]))->name('subscription.expired');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // ── Calendar ─────────────────────────────────────────────────────────────
    Route::get('/calendar', CalendarController::class)->name('calendar');

    // ── Viewings ─────────────────────────────────────────────────────────────
    Route::get('viewings',                               [ViewingController::class, 'index'])->name('viewings.index');
    Route::get('viewings/create',                        [ViewingController::class, 'create'])->name('viewings.create');
    Route::post('viewings',                              [ViewingController::class, 'store'])->name('viewings.store');
    Route::get('viewings/{viewing}',                     [ViewingController::class, 'show'])->name('viewings.show');
    Route::get('viewings/{viewing}/edit',                [ViewingController::class, 'edit'])->name('viewings.edit');
    Route::put('viewings/{viewing}',                     [ViewingController::class, 'update'])->name('viewings.update');
    Route::delete('viewings/{viewing}',                  [ViewingController::class, 'destroy'])->name('viewings.destroy');
    Route::patch('viewings/{viewing}/status',            [ViewingController::class, 'updateStatus'])->name('viewings.status');

    // ── Notifications (JSON API) ─────────────────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');

    // ── Profile ─────────────────────────────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // ── Reports ─────────────────────────────────────────────────────────────
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('leads',   [ReportController::class, 'leads'])->name('leads');
        Route::get('deals',   [ReportController::class, 'deals'])->name('deals');
        Route::get('revenue', [ReportController::class, 'revenue'])->name('revenue');
    });

    // ── Documents ───────────────────────────────────────────────────────────
    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    // ── Tenancies ───────────────────────────────────────────────────────────
    Route::get('tenancies', [TenancyController::class, 'index'])->name('tenancies.index');
    Route::get('tenancies/create', [TenancyController::class, 'create'])->name('tenancies.create');
    Route::post('tenancies', [TenancyController::class, 'store'])->name('tenancies.store');
    Route::get('tenancies/{tenancy}', [TenancyController::class, 'show'])->name('tenancies.show');
    Route::get('tenancies/{tenancy}/edit', [TenancyController::class, 'edit'])->name('tenancies.edit');
    Route::put('tenancies/{tenancy}', [TenancyController::class, 'update'])->name('tenancies.update');
    Route::delete('tenancies/{tenancy}', [TenancyController::class, 'destroy'])->name('tenancies.destroy');
    Route::post('tenancies/{tenancy}/payments/{payment}/record', [TenancyController::class, 'recordPayment'])->name('tenancies.payments.record');
    Route::post('tenancies/{tenancy}/terminate', [TenancyController::class, 'terminate'])->name('tenancies.terminate');
    Route::post('tenancies/{tenancy}/return-deposit', [TenancyController::class, 'returnDeposit'])->name('tenancies.return-deposit');

    // ── Tasks ───────────────────────────────────────────────────────────────
    Route::get('tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    // ── Deals ───────────────────────────────────────────────────────────────
    Route::get('deals', [DealController::class, 'index'])->name('deals.index');
    Route::get('deals/create', [DealController::class, 'create'])->name('deals.create');
    Route::post('deals', [DealController::class, 'store'])->name('deals.store');
    Route::get('deals/{deal}', [DealController::class, 'show'])->name('deals.show');
    Route::get('deals/{deal}/edit', [DealController::class, 'edit'])->name('deals.edit');
    Route::put('deals/{deal}', [DealController::class, 'update'])->name('deals.update');
    Route::delete('deals/{deal}', [DealController::class, 'destroy'])->name('deals.destroy');
    Route::patch('deals/{deal}/stage', [DealController::class, 'moveStage'])->name('deals.stage');
    Route::patch('deals/{deal}/status', [DealController::class, 'status'])->name('deals.status');
    Route::patch('deals/{deal}/assign', [DealController::class, 'assign'])->name('deals.assign');

    // ── Leads ───────────────────────────────────────────────────────────────
    Route::get('leads', [LeadController::class, 'index'])->name('leads.index');
    Route::get('leads/create', [LeadController::class, 'create'])->name('leads.create');
    Route::post('leads', [LeadController::class, 'store'])->name('leads.store');
    Route::get('leads/{lead}', [LeadController::class, 'show'])->name('leads.show');
    Route::get('leads/{lead}/edit', [LeadController::class, 'edit'])->name('leads.edit');
    Route::put('leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
    Route::delete('leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy');
    Route::post('leads/{lead}/convert', [LeadController::class, 'convert'])->name('leads.convert');
    Route::patch('leads/{lead}/assign', [LeadController::class, 'assign'])->name('leads.assign');
    Route::patch('leads/{lead}/status', [LeadController::class, 'status'])->name('leads.status');
    Route::get('leads/{lead}/matches', [PropertyMatchController::class, 'show'])->name('leads.matches');

    // ── CSV Import (must be before {contact}/{lead} wildcards) ───────────────
    Route::get('contacts/import',  [ImportController::class, 'contactsPage'])->name('contacts.import');
    Route::post('contacts/import', [ImportController::class, 'contactsImport'])->name('contacts.import.store');
    Route::get('leads/import',     [ImportController::class, 'leadsPage'])->name('leads.import');
    Route::post('leads/import',    [ImportController::class, 'leadsImport'])->name('leads.import.store');
    Route::get('import/sample/{type}', [ImportController::class, 'sample'])->name('import.sample');

    // ── Contacts ────────────────────────────────────────────────────────────
    Route::get('contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::get('contacts/create', [ContactController::class, 'create'])->name('contacts.create');
    Route::post('contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::get('contacts/{contact}', [ContactController::class, 'show'])->name('contacts.show');
    Route::get('contacts/{contact}/edit', [ContactController::class, 'edit'])->name('contacts.edit');
    Route::put('contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::delete('contacts/{contact}', [ContactController::class, 'destroy'])->name('contacts.destroy');
    Route::post('contacts/{contact}/roles', [ContactController::class, 'storeRole'])->name('contacts.roles.store');
    Route::delete('contacts/{contact}/roles/{role}', [ContactController::class, 'destroyRole'])->name('contacts.roles.destroy');

    // ── Properties ──────────────────────────────────────────────────────────
    Route::get('properties', [PropertyController::class, 'index'])->name('properties.index');
    Route::get('properties/create', [PropertyController::class, 'create'])->name('properties.create');
    Route::post('properties', [PropertyController::class, 'store'])->name('properties.store');
    Route::get('properties/{property}', [PropertyController::class, 'show'])->name('properties.show');
    Route::get('properties/{property}/edit', [PropertyController::class, 'edit'])->name('properties.edit');
    Route::put('properties/{property}', [PropertyController::class, 'update'])->name('properties.update');
    Route::delete('properties/{property}', [PropertyController::class, 'destroy'])->name('properties.destroy');
    Route::patch('properties/{property}/publish', [PropertyController::class, 'publish'])->name('properties.publish');
    // Media
    Route::post('properties/{property}/media', [PropertyController::class, 'storeMedia'])->name('properties.media.store');
    Route::post('properties/{property}/floor-plans', [PropertyController::class, 'storeFloorPlan'])->name('properties.floor-plans.store');
    Route::patch('properties/{property}/media/reorder', [PropertyController::class, 'reorderMedia'])->name('properties.media.reorder');
    Route::delete('properties/{property}/media/{mediaId}', [PropertyController::class, 'destroyMedia'])->name('properties.media.destroy');
    // Owners
    Route::post('properties/{property}/owners', [PropertyController::class, 'storeOwner'])->name('properties.owners.store');
    Route::delete('properties/{property}/owners/{owner}', [PropertyController::class, 'destroyOwner'])->name('properties.owners.destroy');
    // Units
    Route::post('properties/{property}/units', [PropertyController::class, 'storeUnit'])->name('properties.units.store');
    Route::put('properties/{property}/units/{unit}', [PropertyController::class, 'updateUnit'])->name('properties.units.update');
    Route::delete('properties/{property}/units/{unit}', [PropertyController::class, 'destroyUnit'])->name('properties.units.destroy');

    // ── Global search (JSON) ─────────────────────────────────────────────────
    Route::get('/search', SearchController::class)->name('search');

    // ── PDF downloads ───────────────────────────────────────────────────────
    Route::get('properties/{property}/pdf', [PdfController::class, 'propertySheet'])->name('properties.pdf');
    Route::get('tenancies/{tenancy}/pdf', [PdfController::class, 'tenancyAgreement'])->name('tenancies.pdf');
    Route::get('tenancies/payments/{payment}/receipt', [PdfController::class, 'paymentReceipt'])->name('tenancies.payments.receipt');

    // ── Settings (admin only) ────────────────────────────────────────────────
    Route::prefix('settings')->name('settings.')->middleware('role:admin')->group(function () {

        // Pipelines
        Route::get('pipelines', [PipelineController::class, 'index'])->name('pipelines.index');
        Route::post('pipelines', [PipelineController::class, 'store'])->name('pipelines.store');
        Route::patch('pipelines/{pipeline}', [PipelineController::class, 'update'])->name('pipelines.update');
        Route::delete('pipelines/{pipeline}', [PipelineController::class, 'destroy'])->name('pipelines.destroy');

        // Pipeline stages — reorder must precede {stage} to avoid shadowing
        Route::post('pipelines/{pipeline}/stages', [PipelineStageController::class, 'store'])->name('pipeline-stages.store');
        Route::patch('pipelines/{pipeline}/stages/reorder', [PipelineStageController::class, 'reorder'])->name('pipeline-stages.reorder');
        Route::patch('pipelines/{pipeline}/stages/{stage}', [PipelineStageController::class, 'update'])->name('pipeline-stages.update');
        Route::delete('pipelines/{pipeline}/stages/{stage}', [PipelineStageController::class, 'destroy'])->name('pipeline-stages.destroy');

        // Lead sources — reorder before {leadSource}
        Route::get('lead-sources', [LeadSourceController::class, 'index'])->name('lead-sources.index');
        Route::post('lead-sources', [LeadSourceController::class, 'store'])->name('lead-sources.store');
        Route::patch('lead-sources/reorder', [LeadSourceController::class, 'reorder'])->name('lead-sources.reorder');
        Route::patch('lead-sources/{leadSource}', [LeadSourceController::class, 'update'])->name('lead-sources.update');
        Route::delete('lead-sources/{leadSource}', [LeadSourceController::class, 'destroy'])->name('lead-sources.destroy');

        // Property types — reorder before {propertyType}
        Route::get('property-types', [PropertyTypeController::class, 'index'])->name('property-types.index');
        Route::post('property-types', [PropertyTypeController::class, 'store'])->name('property-types.store');
        Route::patch('property-types/reorder', [PropertyTypeController::class, 'reorder'])->name('property-types.reorder');
        Route::patch('property-types/{propertyType}', [PropertyTypeController::class, 'update'])->name('property-types.update');
        Route::delete('property-types/{propertyType}', [PropertyTypeController::class, 'destroy'])->name('property-types.destroy');

        // Amenities — reorder before {amenity}
        Route::get('amenities', [AmenityController::class, 'index'])->name('amenities.index');
        Route::post('amenities', [AmenityController::class, 'store'])->name('amenities.store');
        Route::patch('amenities/reorder', [AmenityController::class, 'reorder'])->name('amenities.reorder');
        Route::patch('amenities/{amenity}', [AmenityController::class, 'update'])->name('amenities.update');
        Route::delete('amenities/{amenity}', [AmenityController::class, 'destroy'])->name('amenities.destroy');

        // Task types — reorder before {taskType}
        Route::get('task-types', [TaskTypeController::class, 'index'])->name('task-types.index');
        Route::post('task-types', [TaskTypeController::class, 'store'])->name('task-types.store');
        Route::patch('task-types/reorder', [TaskTypeController::class, 'reorder'])->name('task-types.reorder');
        Route::patch('task-types/{taskType}', [TaskTypeController::class, 'update'])->name('task-types.update');
        Route::delete('task-types/{taskType}', [TaskTypeController::class, 'destroy'])->name('task-types.destroy');

        // Document types — reorder before {documentType}
        Route::get('document-types', [DocumentTypeController::class, 'index'])->name('document-types.index');
        Route::post('document-types', [DocumentTypeController::class, 'store'])->name('document-types.store');
        Route::patch('document-types/reorder', [DocumentTypeController::class, 'reorder'])->name('document-types.reorder');
        Route::patch('document-types/{documentType}', [DocumentTypeController::class, 'update'])->name('document-types.update');
        Route::delete('document-types/{documentType}', [DocumentTypeController::class, 'destroy'])->name('document-types.destroy');

        // Team members
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::patch('users/{user}/toggle', [UserController::class, 'toggleActive'])->name('users.toggle');
        Route::patch('users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');

        // Automation rules
        Route::get('automation-rules', [AutomationRuleController::class, 'index'])->name('automation-rules.index');
        Route::post('automation-rules', [AutomationRuleController::class, 'store'])->name('automation-rules.store');
        Route::patch('automation-rules/{automationRule}', [AutomationRuleController::class, 'update'])->name('automation-rules.update');
        Route::patch('automation-rules/{automationRule}/toggle', [AutomationRuleController::class, 'toggleActive'])->name('automation-rules.toggle');
        Route::delete('automation-rules/{automationRule}', [AutomationRuleController::class, 'destroy'])->name('automation-rules.destroy');

        // Email log
        Route::get('email-log', [EmailLogController::class, 'index'])->name('email-log.index');

        // WhatsApp templates
        Route::get('whatsapp', [WhatsappController::class, 'index'])->name('whatsapp.index');
        Route::post('whatsapp', [WhatsappController::class, 'store'])->name('whatsapp.store');
        Route::patch('whatsapp/{whatsappTemplate}', [WhatsappController::class, 'update'])->name('whatsapp.update');
        Route::delete('whatsapp/{whatsappTemplate}', [WhatsappController::class, 'destroy'])->name('whatsapp.destroy');
    });

    // WhatsApp compose (all agents)
    Route::post('/whatsapp/compose', [WhatsappController::class, 'compose'])->name('whatsapp.compose');
});

// ── Super Admin ──────────────────────────────────────────────────────────────
Route::middleware(['auth', 'super_admin'])->prefix('superadmin')->name('superadmin.')->group(function () {
    Route::get('/',                                     [SADashboard::class, 'index'])->name('dashboard');

    // Companies
    Route::get('companies',                             [SACompany::class, 'index'])->name('companies.index');
    Route::get('companies/create',                      [SACompany::class, 'create'])->name('companies.create');
    Route::post('companies',                            [SACompany::class, 'store'])->name('companies.store');
    Route::get('companies/{company}',                   [SACompany::class, 'show'])->name('companies.show');
    Route::patch('companies/{company}/toggle',          [SACompany::class, 'toggleActive'])->name('companies.toggle');
    Route::patch('companies/{company}/subscription',    [SACompany::class, 'updateSubscription'])->name('companies.subscription');

    // Plans
    Route::get('plans',                                 [SAPlan::class, 'index'])->name('plans.index');
    Route::post('plans',                                [SAPlan::class, 'store'])->name('plans.store');
    Route::put('plans/{plan}',                          [SAPlan::class, 'update'])->name('plans.update');
    Route::delete('plans/{plan}',                       [SAPlan::class, 'destroy'])->name('plans.destroy');
});
