<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Lead;
use App\Models\LeadSource;
use App\Models\Pipeline;
use App\Models\Tenancy;
use App\Models\TenancyPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function leads(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        $query = Lead::whereBetween('created_at', [$from, $to]);

        // By status
        $byStatus = Lead::whereBetween('created_at', [$from, $to])
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->mapWithKeys(fn ($c, $s) => [ucfirst(str_replace('_', ' ', $s)) => (int) $c])
            ->toArray();

        // By source
        $bySource = Lead::whereBetween('leads.created_at', [$from, $to])
            ->leftJoin('lead_sources', 'leads.lead_source_id', '=', 'lead_sources.id')
            ->selectRaw('COALESCE(lead_sources.name, "Unknown") as source, COUNT(*) as count')
            ->groupBy('source')
            ->orderBy('count', 'desc')
            ->pluck('count', 'source')
            ->mapWithKeys(fn ($c, $s) => [$s => (int) $c])
            ->toArray();

        // Over time (monthly)
        $overTime = $this->monthlyBreakdown($from, $to, fn ($y, $m) =>
            Lead::whereYear('created_at', $y)->whereMonth('created_at', $m)->count()
        );

        // Conversion metrics
        $total      = Lead::whereBetween('created_at', [$from, $to])->count();
        $converted  = Lead::whereBetween('created_at', [$from, $to])->where('status', 'converted')->count();
        $lost       = Lead::whereBetween('created_at', [$from, $to])->where('status', 'lost')->count();
        $convRate   = $total > 0 ? round($converted / $total * 100, 1) : 0;

        return Inertia::render('Reports/Leads', [
            'byStatus'    => $byStatus,
            'bySource'    => $bySource,
            'overTime'    => $overTime,
            'summary'     => compact('total', 'converted', 'lost', 'convRate'),
            'filters'     => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        ]);
    }

    public function deals(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        // By status
        $byStatus = Deal::whereBetween('created_at', [$from, $to])
            ->selectRaw('status, COUNT(*) as count, COALESCE(SUM(value), 0) as value')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn ($r) => [
                ucfirst(str_replace('_', ' ', $r->status)) => ['count' => (int) $r->count, 'value' => (float) $r->value]
            ])
            ->toArray();

        // By pipeline (open only)
        $byPipeline = Deal::where('deals.status', 'open')
            ->whereBetween('deals.created_at', [$from, $to])
            ->join('pipelines', 'deals.pipeline_id', '=', 'pipelines.id')
            ->selectRaw('pipelines.name, COUNT(*) as count, COALESCE(SUM(deals.value), 0) as value')
            ->groupBy('pipelines.name')
            ->get()
            ->map(fn ($r) => ['name' => $r->name, 'count' => (int) $r->count, 'value' => (float) $r->value])
            ->toArray();

        // Won deals over time
        $wonOverTime = $this->monthlyBreakdown($from, $to, fn ($y, $m) => [
            'count' => Deal::where('status', 'won')->whereYear('closed_at', $y)->whereMonth('closed_at', $m)->count(),
            'value' => (float) Deal::where('status', 'won')->whereYear('closed_at', $y)->whereMonth('closed_at', $m)->sum('value'),
        ]);

        $total     = Deal::whereBetween('created_at', [$from, $to])->count();
        $won       = Deal::whereBetween('created_at', [$from, $to])->where('status', 'won')->count();
        $wonValue  = (float) Deal::whereBetween('created_at', [$from, $to])->where('status', 'won')->sum('value');
        $avgValue  = $total > 0 ? round((float) Deal::whereBetween('created_at', [$from, $to])->avg('value'), 2) : 0;
        $winRate   = $total > 0 ? round($won / $total * 100, 1) : 0;

        return Inertia::render('Reports/Deals', [
            'byStatus'    => $byStatus,
            'byPipeline'  => $byPipeline,
            'wonOverTime' => $wonOverTime,
            'summary'     => compact('total', 'won', 'wonValue', 'avgValue', 'winRate'),
            'filters'     => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        ]);
    }

    public function revenue(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        // Monthly expected vs collected
        $monthly = $this->monthlyBreakdown($from, $to, fn ($y, $m) => [
            'expected'  => (float) TenancyPayment::whereYear('due_date', $y)->whereMonth('due_date', $m)
                            ->whereIn('status', ['pending', 'paid', 'partial', 'overdue'])->sum('amount'),
            'collected' => (float) TenancyPayment::where('status', 'paid')
                            ->whereYear('paid_date', $y)->whereMonth('paid_date', $m)->sum('amount'),
        ]);

        // By payment method
        $byMethod = TenancyPayment::where('status', 'paid')
            ->whereBetween('paid_date', [$from, $to])
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as value')
            ->groupBy('payment_method')
            ->get()
            ->mapWithKeys(fn ($r) => [
                ucfirst(str_replace('_', ' ', $r->payment_method ?? 'Unknown')) => [
                    'count' => (int) $r->count, 'value' => (float) $r->value
                ]
            ])
            ->toArray();

        // Summary
        $totalExpected  = (float) TenancyPayment::whereBetween('due_date', [$from, $to])
                            ->whereIn('status', ['pending', 'paid', 'partial', 'overdue'])->sum('amount');
        $totalCollected = (float) TenancyPayment::where('status', 'paid')
                            ->whereBetween('paid_date', [$from, $to])->sum('amount');
        $totalOverdue   = (float) TenancyPayment::where('status', 'overdue')->sum('amount');
        $overdueCount   = TenancyPayment::where('status', 'overdue')->count();
        $collectionRate = $totalExpected > 0 ? round($totalCollected / $totalExpected * 100, 1) : 0;

        return Inertia::render('Reports/Revenue', [
            'monthly'      => $monthly,
            'byMethod'     => $byMethod,
            'summary'      => compact('totalExpected', 'totalCollected', 'totalOverdue', 'overdueCount', 'collectionRate'),
            'filters'      => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function dateRange(Request $request): array
    {
        $from = $request->filled('from')
            ? Carbon::parse($request->from)->startOfDay()
            : now()->subMonths(5)->startOfMonth()->startOfDay();

        $to = $request->filled('to')
            ? Carbon::parse($request->to)->endOfDay()
            : now()->endOfMonth()->endOfDay();

        return [$from, $to];
    }

    private function monthlyBreakdown(Carbon $from, Carbon $to, callable $fn): array
    {
        $result  = [];
        $current = $from->copy()->startOfMonth();

        while ($current->lte($to)) {
            $value = $fn($current->year, $current->month);
            if (is_array($value)) {
                $result[] = array_merge(['month' => $current->format('M y')], $value);
            } else {
                $result[] = ['month' => $current->format('M y'), 'count' => $value];
            }
            $current->addMonth();
        }

        return $result;
    }
}
