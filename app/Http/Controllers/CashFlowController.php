<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\LocalSociety;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CashFlowController extends Controller
{
    /**
     * Display the Cash Flow dashboard and transactions list.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Scope transactions to what the admin can see
        $societyIds = $user->getAccessibleSocietyIds();

        // 1. Calculations for the summary dashboard
        $transactionsQuery = Transaction::whereIn('local_society_id', $societyIds);

        // Optional filtering by date/category
        $dateFilter = $request->query('period', 'all'); // 'today', 'week', 'month', 'all'
        
        $summaryQuery = clone $transactionsQuery;
        if ($dateFilter === 'today') {
            $summaryQuery->whereDate('transaction_date', today());
        } elseif ($dateFilter === 'week') {
            $summaryQuery->whereBetween('transaction_date', [now()->startOfWeek(), now()->endOfWeek()]);
        } elseif ($dateFilter === 'month') {
            $summaryQuery->whereMonth('transaction_date', now()->month)
                         ->whereYear('transaction_date', now()->year);
        }

        $totals = $summaryQuery->select(
            DB::raw("SUM(CASE WHEN type = 'inflow' THEN amount ELSE 0 END) as total_inflow"),
            DB::raw("SUM(CASE WHEN type = 'outflow' THEN amount ELSE 0 END) as total_outflow")
        )->first();

        $totalInflow = $totals->total_inflow ?? 0;
        $totalOutflow = $totals->total_outflow ?? 0;
        $netCashFlow = $totalInflow - $totalOutflow;

        // 2. Fetch Transactions (Paginated or limited for the list)
        $transactions = $transactionsQuery
            ->with(['localSociety.district.annualConference', 'creator'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        // Pass accessible societies so Society Admins can add entries
        // Or if Conference Admin, they can select which society it belongs to
        $societies = LocalSociety::whereIn('id', $societyIds)->orderBy('name')->get();

        return Inertia::render('CashFlow/Index', [
            'transactions' => $transactions,
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
     * Store a newly created transaction.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Ensure user can manage the selected society
        $societyIds = $user->getAccessibleSocietyIds();

        $validated = $request->validate([
            'local_society_id' => ['required', 'integer', \Illuminate\Validation\Rule::in($societyIds)],
            'type'             => 'required|in:inflow,outflow',
            'category'         => 'required|string|max:100',
            'amount'           => 'required|numeric|min:0.01',
            'description'      => 'nullable|string',
            'transaction_date' => 'required|date',
            'payment_method'   => 'required|in:Cash,Check,Bank Transfer,Online,Other',
        ]);

        $validated['created_by'] = $user->id;

        Transaction::create($validated);

        return redirect()->back()->with('success', 'Transaction recorded successfully.');
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Request $request, Transaction $transaction)
    {
        $user = $request->user();
        
        if (!in_array($transaction->local_society_id, $user->getAccessibleSocietyIds())) {
            abort(403);
        }

        $transaction->delete();

        return redirect()->back()->with('success', 'Transaction deleted successfully.');
    }
}
