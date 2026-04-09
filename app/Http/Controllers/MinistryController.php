<?php

namespace App\Http\Controllers;

use App\Models\Ministry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MinistryController extends Controller
{
    /**
     * Display a listing of ministries, scoped by hierarchy.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        $ministries = Ministry::whereIn('local_society_id', $societyIds)
            ->with(['leader', 'localSociety.district.annualConference'])
            ->orderBy('name')
            ->paginate(10);


        return Inertia::render('Ministries/Index', [
            'ministries' => $ministries,
            'canManage' => $user->isSocietyAdmin(),
        ]);
    }
}
