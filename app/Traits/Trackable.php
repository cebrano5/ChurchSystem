<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

trait Trackable
{
    public static function bootTrackable()
    {
        static::deleting(function ($model) {
            if (method_exists($model, 'isForceDeleting') && !$model->isForceDeleting()) {
                if (Auth::check()) {
                    $model->deleted_by = Auth::id();
                    // We need to save the model separately if it's already in the process of deleting
                    // or just set the attribute if the deleting event hasn't finished.
                }
            }
        });

        static::deleted(function ($model) {
            if (method_exists($model, 'isForceDeleting') && !$model->isForceDeleting()) {
                self::logActivity($model, 'archive', "Archived " . class_basename($model) . ": " . ($model->name ?? $model->full_name ?? $model->title ?? $model->id));
            }
        });

        static::restored(function ($model) {
            self::logActivity($model, 'restore', "Restored " . class_basename($model) . ": " . ($model->name ?? $model->full_name ?? $model->title ?? $model->id));
        });

        static::created(function ($model) {
            self::logActivity($model, 'create', "Created " . class_basename($model) . ": " . ($model->name ?? $model->full_name ?? $model->title ?? $model->id));
        });

        static::updated(function ($model) {
            // Avoid logging if only deleted_by was changed
            if ($model->isDirty('deleted_by') && count($model->getDirty()) === 1) return;
            
            self::logActivity($model, 'update', "Updated " . class_basename($model) . ": " . ($model->name ?? $model->full_name ?? $model->title ?? $model->id));
        });
    }

    public function deletedByUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by');
    }

    protected static function logActivity($model, $action, $description)
    {
        if (Auth::check()) {
            AuditLog::create([
                'user_id' => Auth::id(),
                'action' => $action,
                'auditable_type' => get_class($model),
                'auditable_id' => $model->id,
                'description' => $description,
                'ip_address' => request()->ip(),
            ]);
        }
    }
}
