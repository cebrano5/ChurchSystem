<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Universal Dashboard - Controller decides what data to show based on role
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // National Admin Routes
    Route::middleware('role:national_admin')->group(function () {
        Route::resource('conferences', \App\Http\Controllers\AnnualConferenceController::class);
    });

    // Conference Admin & Above
    Route::middleware('role:national_admin|conference_admin')->group(function () {
        Route::resource('districts', \App\Http\Controllers\DistrictController::class);
    });

    // District Admin & Above
    Route::middleware('role:national_admin|conference_admin|district_admin')->group(function () {

        
        Route::resource('societies', \App\Http\Controllers\LocalSocietyController::class);
        
        // Church Map
        Route::get('map', [\App\Http\Controllers\ChurchMapController::class, 'index'])->name('map.index');
        Route::patch('map/{type}/{id}/location', [\App\Http\Controllers\ChurchMapController::class, 'updateLocation'])->name('map.location.update');
    });

    // Society Admin & Above
    Route::middleware('role:national_admin|conference_admin|district_admin|society_admin')->group(function () {
        Route::resource('members', \App\Http\Controllers\MemberController::class)->except(['show']);

        Route::resource('ministries', \App\Http\Controllers\MinistryController::class);
        Route::post('ministries/{ministry}/members', [\App\Http\Controllers\MinistryController::class, 'addMember'])->name('ministries.members.add');
        Route::delete('ministries/{ministry}/members/{member}', [\App\Http\Controllers\MinistryController::class, 'removeMember'])->name('ministries.members.remove');
        
        // All admins can view, create, update, and delete events within their scope
        Route::get('events/series/{series_id}', [\App\Http\Controllers\EventController::class, 'series'])->name('events.series');
        Route::resource('events', \App\Http\Controllers\EventController::class);

        // Society Admins can store, all admins can view index.
        Route::resource('donations', \App\Http\Controllers\DonationController::class)->only(['index', 'store']);

        // Attendance Recording
        Route::post('attendance', [\App\Http\Controllers\AttendanceController::class, 'store'])->name('attendance.store');
        Route::post('attendance/remove', [\App\Http\Controllers\AttendanceController::class, 'remove'])->name('attendance.remove');

    });

    // Profile (Standard Breeze)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
