<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\LocalSociety;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class DonationController extends Controller
{
    /**
     * Display the Financial Statement (Cash Flow) dashboard and transactions list.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $societyIds = $user->getAccessibleSocietyIds();

        $transactionsQuery = Donation::whereIn('local_society_id', $societyIds);

        $dateFilter = $request->query('period', 'all'); 
        
        $summaryQuery = clone $transactionsQuery;
        if ($dateFilter === 'today') {
            $summaryQuery->whereDate('donation_date', today());
        } elseif ($dateFilter === 'week') {
            $summaryQuery->whereBetween('donation_date', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($dateFilter === 'month') {
            $summaryQuery->whereMonth('donation_date', now()->month)
                         ->whereYear('donation_date', now()->year);
        }

        $totals = $summaryQuery->select(
            DB::raw("SUM(CASE WHEN type = 'inflow' THEN amount ELSE 0 END) as total_inflow"),
            DB::raw("SUM(CASE WHEN type = 'outflow' THEN amount ELSE 0 END) as total_outflow")
        )->first();

        $totalInflow = $totals->total_inflow ?? 0;
        $totalOutflow = $totals->total_outflow ?? 0;
        $netCashFlow = $totalInflow - $totalOutflow;

        $donations = $transactionsQuery
            ->with(['member', 'localSociety.district.annualConference'])
            ->orderBy('donation_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        $members = $user->isSocietyAdmin() 
            ? \App\Models\Member::where('local_society_id', $user->scope_id)->orderBy('first_name')->get() 
            : [];

        $societies = LocalSociety::whereIn('id', $societyIds)->orderBy('name')->get();

        return Inertia::render('Donations/Index', [
            'donations' => $donations,
            'canManage' => $user->isSocietyAdmin(), // Only Society Admins can add transactions
            'members' => $members,
            'summary' => [
                'inflow' => $totalInflow,
                'outflow' => $totalOutflow,
                'net' => $netCashFlow,
                'period' => $dateFilter,
            ],
            'societies' => $societies,
        ]);
    }

    /**
     * Store a newly created transaction (Inflow/Outflow).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSocietyAdmin()) {
            abort(403, 'Only Local Society Administrators can record transactions.');
        }
        
        $societyIds = $user->getAccessibleSocietyIds();

        $validated = $request->validate([
            'local_society_id' => ['required', 'integer', \Illuminate\Validation\Rule::in($societyIds)],
            'member_id'        => 'nullable|exists:members,id',
            'type'             => 'required|in:inflow,outflow',
            'category'         => 'required|string|max:100',
            'amount'           => 'required|numeric|min:0.01',
            'notes'            => 'nullable|string',
            'donation_date'    => 'required|date',
            'payment_method'   => 'required|in:Cash,Check,Bank Transfer,Online,Other',
        ]);

        Donation::create($validated);

        return redirect()->back()->with('success', 'Financial record added successfully.');
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isSocietyAdmin()) {
            abort(403, 'Only Local Society Administrators can delete transactions.');
        }
        
        $donation = Donation::find($id);

        if (!$donation) {
            return redirect()->back();
        }

        if (!in_array($donation->local_society_id, $user->getAccessibleSocietyIds())) {
            abort(403);
        }

        $donation->delete(); // Soft delete — sets deleted_at

        return redirect()->back()->with('success', 'Financial record archived successfully.');
    }

    /**
     * Export financial statement as PDF.
     */
    public function pdf(Request $request)
    {
        $user = $request->user();
        $societyIds = $user->getAccessibleSocietyIds();

        $donations = Donation::whereIn('local_society_id', $societyIds)
            ->with(['member', 'localSociety.district.annualConference'])
            ->orderBy('donation_date', 'desc')
            ->get();

        $totalInflow  = $donations->where('type', 'inflow')->sum('amount');
        $totalOutflow = $donations->where('type', 'outflow')->sum('amount');
        $net          = $totalInflow - $totalOutflow;

        $pdf = Pdf::loadView('pdf.financial-statement', [
            'donations'    => $donations,
            'user'         => $user,
            'date'         => now()->format('F d, Y'),
            'totalInflow'  => $totalInflow,
            'totalOutflow' => $totalOutflow,
            'net'          => $net,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream('financial-statement-' . now()->format('Ymd') . '.pdf');
    }
}
