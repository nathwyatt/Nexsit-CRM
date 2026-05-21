<?php

namespace App\Http\Controllers\Crm\Settings;

use App\Http\Controllers\Controller;
use App\Models\Pipeline;
use App\Models\PipelineStage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PipelineStageController extends Controller
{
    public function store(Request $request, Pipeline $pipeline)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'required|string|max:7',
            'probability' => 'required|integer|min:0|max:100',
            'type'        => 'required|in:open,won,lost',
        ]);

        $data['is_won_stage']  = $data['type'] === 'won';
        $data['is_lost_stage'] = $data['type'] === 'lost';
        unset($data['type']);

        $data['position'] = $pipeline->stages()->max('position') + 1;

        $pipeline->stages()->create($data);

        return back()->with('success', 'Stage added.');
    }

    public function update(Request $request, Pipeline $pipeline, PipelineStage $stage)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'color'       => 'required|string|max:7',
            'probability' => 'required|integer|min:0|max:100',
            'type'        => 'required|in:open,won,lost',
        ]);

        $data['is_won_stage']  = $data['type'] === 'won';
        $data['is_lost_stage'] = $data['type'] === 'lost';
        unset($data['type']);

        $stage->update($data);

        return back()->with('success', 'Stage updated.');
    }

    public function destroy(Pipeline $pipeline, PipelineStage $stage)
    {
        if ($stage->deals()->exists()) {
            return back()->withErrors(['stage' => 'Cannot delete a stage that has deals.']);
        }

        $stage->delete();

        return back()->with('success', 'Stage deleted.');
    }

    public function reorder(Request $request, Pipeline $pipeline)
    {
        $request->validate([
            'stages'   => 'required|array',
            'stages.*' => 'integer|exists:pipeline_stages,id',
        ]);

        DB::transaction(function () use ($request, $pipeline) {
            foreach ($request->stages as $position => $stageId) {
                $pipeline->stages()
                    ->where('id', $stageId)
                    ->update(['position' => $position + 1]);
            }
        });

        return back()->with('success', 'Stages reordered.');
    }
}
