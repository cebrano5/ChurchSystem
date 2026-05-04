<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Event;
use Illuminate\Support\Str;

$events = Event::whereNull('series_id')->get()->groupBy(function($e) {
    return $e->name . '|' . $e->organizer_id . '|' . $e->organizer_type;
});

$count = 0;
foreach ($events as $group) {
    if ($group->count() > 1) {
        $seriesId = (string) Str::uuid();
        foreach ($group as $e) {
            $e->update(['series_id' => $seriesId]);
            $count++;
        }
    }
}

echo "Successfully backfilled $count events into series.";
