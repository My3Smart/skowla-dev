<?php

namespace App\Http\Services;

use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CbsService
{
    public function syncUser(User $user): array
    {
        $url = rtrim(config('services.cbs.url'), '/');
        $apiKey = config('services.cbs.api_key');
        $organizationId = config('services.cbs.organization_id');

        if (!$url || !$apiKey || !$organizationId) {
            throw new RuntimeException(
                'CBS configuration is missing.'
            );
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->timeout(10)
            ->post($url . '/users/sync', [
                'organization_id' => $organizationId,
                'user_code' => 'SKOOLA-PARENT-' . $user->id,
                'full_name' => $user->name,
                'email' => $user->email,
                'mobile' => $user->phone_num,
                'password_hash' => $user->getAuthPassword(),
            ]);

        if ($response->failed() || !$response->json('success')) {
            Log::error('CBS user synchronization failed', [
                'skoola_user_id' => $user->id,
                'status' => $response->status(),
            ]);

            throw new RuntimeException(
                'Unable to synchronize user with CBS.'
            );
        }

        return $response->json();
    }

    public function syncStudent(Student $student): array
{
    $url = rtrim(config('services.cbs.url'), '/');
    $apiKey = config('services.cbs.api_key');
    $organizationId = config('services.cbs.organization_id');

    if (!$url || !$apiKey || !$organizationId) {
        throw new RuntimeException('CBS configuration is missing.');
    }

    $response = Http::withToken($apiKey)
        ->acceptJson()
        ->timeout(10)
        ->post($url . '/users/sync', [
            'organization_id' => $organizationId,
            'user_code' => 'SKOOLA-STUDENT-' . $student->id,
            'full_name' => $student->name,
            'email' => null,
            'mobile' => null,
        ]);

    if ($response->failed() || !$response->json('success')) {
        Log::error('CBS student synchronization failed', [
            'skoola_student_id' => $student->id,
            'status' => $response->status(),
        ]);

        throw new RuntimeException(
            'Unable to synchronize student with CBS.'
        );
    }

    return $response->json();
}

public function syncDependent(
    User $guardian,
    Student $student
): array {
    // Ensure both accounts exist in CBS.
    $guardianResult = $this->syncUser($guardian);
    $studentResult = $this->syncStudent($student);

    $guardianId = $guardianResult['userId'];
    $childId = $studentResult['userId'];

    $url = rtrim(config('services.cbs.url'), '/');

    $response = Http::withToken(config('services.cbs.api_key'))
        ->acceptJson()
        ->timeout(10)
        ->post($url . '/users/dependents/sync', [
            'guardian_id' => $guardianId,
            'child_id' => $childId,
            'relationship' => $guardian->relationship
                ?? 'Guardian',
            'date_of_birth' => $student->dob,
        ]);

    if ($response->failed() || !$response->json('success')) {
        Log::error('CBS dependent synchronization failed', [
            'guardian_id' => $guardian->id,
            'student_id' => $student->id,
            'status' => $response->status(),
        ]);

        throw new RuntimeException(
            'Unable to synchronize dependent with CBS.'
        );
    }

    return $response->json();
}

public function syncParentWithChildren(User $user): array
{
    if (!$user->hasRole('parent')) {
        throw new \RuntimeException('User is not a parent.');
    }

    // Synchronize parent and parent wallet.
    $parentResult = $this->syncUser($user);

    // Find children linked through the guardians table.
    $guardianStudentIds = collect();

    if (!empty(trim((string) $user->ic))) {
        $guardianStudentIds = DB::table('guardians')
            ->where('ic', $user->ic)
            ->pluck('student_id');
    }

    // Find children linked through the parent_student pivot.
    $pivotStudentIds = DB::table('parent_student')
        ->where('parent_id', $user->id)
        ->pluck('student_id');

    // Combine both sources and remove duplicates.
    $studentIds = $guardianStudentIds
        ->merge($pivotStudentIds)
        ->filter()
        ->unique()
        ->values();

    $students = Student::whereIn('id', $studentIds)->get();

    $synced = 0;
    $failed = [];

    foreach ($students as $student) {
        try {
            $this->syncDependent($user, $student);

            $synced++;

        } catch (\Throwable $e) {
            $failed[] = $student->id;

            \Log::error('CBS child synchronization failed', [
                'parent_id' => $user->id,
                'student_id' => $student->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    \Log::info('CBS parent and children synchronization completed', [
        'parent_id' => $user->id,
        'total_students' => $students->count(),
        'synced_students' => $synced,
        'failed_students' => $failed,
    ]);

    return [
        'success' => empty($failed),
        'parent' => $parentResult,
        'total_students' => $students->count(),
        'synced_students' => $synced,
        'failed_students' => $failed,
    ];
}
}