<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Universal Dashboard - Controller decides what data to show based on role
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // National Admin Routes
    Route::middleware('role:national_admin')->group(function () {
        Route::resource('conferences', \App\Http\Controllers\AnnualConferenceController::class)->except(['show']);
    });

    // Conference Admin & Above
    Route::middleware('role:national_admin|conference_admin')->group(function () {
        Route::resource('districts', \App\Http\Controllers\DistrictController::class)->except(['show']);
    });

    // District Admin & Above
    Route::middleware('role:national_admin|conference_admin|district_admin')->group(function () {
        Route::resource('users', \App\Http\Controllers\UserManagementController::class)->except(['show']);
        
        Route::resource('societies', \App\Http\Controllers\LocalSocietyController::class)->except(['show']);
    });

    // Society Admin & Above
    Route::middleware('role:national_admin|conference_admin|district_admin|society_admin')->group(function () {
        Route::resource('members', \App\Http\Controllers\MemberController::class)->except(['show']);

        Route::get('/ministries', function () {
            return Inertia::render('Ministries/Index', ['ministries' => \App\Models\Ministry::with(['leader', 'localSociety'])->get()]);
        })->name('ministries.index');

        Route::get('/events', function () {
            return Inertia::render('Events/Index', ['events' => \App\Models\Event::withCount('attendance')->get()]);
        })->name('events.index');

        Route::get('/donations', function () {
            return Inertia::render('Donations/Index', ['donations' => \App\Models\Donation::with('member')->get()]);
        })->name('donations.index');
    });

    // Profile (Standard Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
