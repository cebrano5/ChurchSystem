<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\AnnualConference;
use App\Models\District;
use App\Models\LocalSociety;
use App\Models\Pastor;
use App\Models\Member;
use App\Models\Ministry;
use App\Models\Event;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        // For simplicity and speed in this example, we'll fetch all trashed items.
        // In a strictly scoped scenario, you might filter these by $request->user()->getAccessibleSocietyIds()
        
        $archives = [
            'users' => User::onlyTrashed()->get(),
            'conferences' => AnnualConference::onlyTrashed()->get(),
            'districts' => District::onlyTrashed()->get(),
            'societies' => LocalSociety::onlyTrashed()->get(),
            'pastors' => Pastor::onlyTrashed()->get(),
            'members' => Member::onlyTrashed()->get(),
            'ministries' => Ministry::onlyTrashed()->get(),
            'events' => Event::onlyTrashed()->get(),
        ];

        return Inertia::render('Settings/Archive', [
            'archives' => $archives,
            'canManage' => true,
        ]);
    }

    public function restore(Request $request, $type, $id)
    {
        $modelMap = [
            'users' => User::class,
            'conferences' => AnnualConference::class,
            'districts' => District::class,
            'societies' => LocalSociety::class,
            'pastors' => Pastor::class,
            'members' => Member::class,
            'ministries' => Ministry::class,
            'events' => Event::class,
        ];

        if (!array_key_exists($type, $modelMap)) {
            abort(404);
        }

        $modelClass = $modelMap[$type];
        $record = $modelClass::onlyTrashed()->findOrFail($id);
        $record->restore();

        return back()->with('success', 'Record restored successfully.');
    }
}
