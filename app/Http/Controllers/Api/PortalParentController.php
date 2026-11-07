<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\SchoolGrade;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Additive JSON endpoints for the React portal:
 * parent dashboard / profile / guardians / attendance,
 * school reports and class management.
 * Reuses the existing models + database; no Blade or schema changes.
 */
class PortalParentController extends Controller
{
    private function serializeAttendance(Attendance $a): array
    {
        return [
            'id'        => $a->id,
            'date'      => (string) $a->date,
            'check_in'  => $a->check_in,
            'check_out' => $a->check_out,
            'status'    => $a->status,
            'remarks'   => $a->remarks ?? null,
            'student'   => $a->student ? [
                'name'       => $a->student->name,
                'grade'      => $a->student->grade,
                'class_name' => $a->student->class_name,
                'school'     => ['name' => $a->student->school?->name],
            ] : null,
        ];
    }

    /** Parent dashboard: children + today's attendance + yearly attend/absent counts. */
    public function dashboard(Request $request)
    {
        $parent = $request->user();
        $currentYear = Carbon::now()->year;

        $studentIds = $parent->students ? $parent->students->pluck('id')->toArray() : [];

        $students = Student::whereIn('id', $studentIds)->pluck('name', 'id')->toArray();

        $attendanceList = Attendance::whereIn('student_id', $studentIds)
            ->whereDate('date', Carbon::today())
            ->with(['student.school'])
            ->orderBy('student_id')
            ->get()
            ->map(fn (Attendance $a) => $this->serializeAttendance($a))
            ->values();

        $counts = function (string $status) use ($studentIds, $currentYear) {
            return Attendance::whereIn('student_id', $studentIds)
                ->whereYear('date', $currentYear)
                ->where('status', $status)
                ->select('student_id', DB::raw('count(*) as total'))
                ->groupBy('student_id')
                ->pluck('total', 'student_id')
                ->toArray();
        };

        $attend = $counts('attend');
        $absent = $counts('absent');

        $attendanceData = [];
        foreach ($students as $id => $name) {
            $attendanceData[$id] = [(int) ($attend[$id] ?? 0), (int) ($absent[$id] ?? 0)];
        }

        return response()->json([
            'parent' => [
                'id'      => $parent->id,
                'name'    => $parent->name,
                'ic'      => $parent->ic,
                'address' => $parent->address,
            ],
            'students'       => (object) $students,
            'attendanceList' => $attendanceList,
            'attendanceData' => (object) $attendanceData,
        ]);
    }

    /** All attendance rows for the parent's children. */
    public function attendance(Request $request)
    {
        $parent = $request->user();
        $studentIds = $parent->students ? $parent->students->pluck('id')->toArray() : [];

        $rows = Attendance::whereIn('student_id', $studentIds)
            ->with(['student.school'])
            ->orderByDesc('date')
            ->limit(500)
            ->get()
            ->map(fn (Attendance $a) => $this->serializeAttendance($a))
            ->values();

        return response()->json(['attendances' => $rows]);
    }

    private function serializeGuardian(User $g): array
    {
        return [
            'id'           => $g->id,
            'name'         => $g->name,
            'ic'           => $g->ic,
            'phone_num'    => $g->phone_num,
            'email'        => $g->email,
            'username'     => $g->username,
            'occupation'   => $g->occupation,
            'relationship' => $g->relationship,
            'address'      => $g->address,
        ];
    }

    /** Parent profile + additional guardians. */
    public function profile(Request $request)
{
    $parent = $request->user();

    $guardians = collect($parent->additionalGuardians());

    $maxAdditionalGuardians = 3;
    $guardianCount = $guardians->count();

    $canAddGuardian = $guardianCount < $maxAdditionalGuardians;

    return response()->json([
        'parent' => [
            'id'           => $parent->id,
            'name'         => $parent->name,
            'email'        => $parent->email,
            'ic'           => $parent->ic,
            'phone_num'    => $parent->phone_num,
            'occupation'   => $parent->occupation,
            'relationship' => $parent->relationship,
            'username'     => $parent->username,
            'address'      => $parent->address,
            'guardian_limit' => $maxAdditionalGuardians,
            'guardian_count' => $guardianCount,
            'can_add_guardian' => $canAddGuardian,
        ],

        'state' => $parent->state
            ? ['name' => $parent->state->name]
            : null,

        'citie' => $parent->citie
            ? ['name' => $parent->citie->name]
            : null,

        'postcode' => $parent->postcode
            ? ['name' => $parent->postcode->name]
            : null,

        'guardians' => collect($guardians)
            ->map(fn ($g) => [
                'id'        => $g->id,
                'name'      => $g->name,
                'phone_num' => $g->phone ?? null,
                'email'     => $g->email ?? null,
            ])
            ->values(),
    ]);
}

    /** Single guardian. */
    public function showGuardian(Request $request, $guardian)
{
    // $guardian = guardians.id
    $guardianRecord = DB::table('guardians')
        ->where('id', $guardian)
        ->first();

    if (! $guardianRecord) {
        return response()->json([
            'message' => 'Guardian not found.'
        ], 404);
    }

    // Find full user details through email
    $user = User::where('email', $guardianRecord->email)->first();

    if (! $user) {
        return response()->json([
            'message' => 'Guardian user account not found.'
        ], 404);
    }

    // Get full user details
    $guardianData = $this->serializeGuardian($user);

    // IMPORTANT:
    // Override users.id with guardians.id
    $guardianData['id'] = $guardianRecord->id;

    return response()->json([
        'guardian' => $guardianData,
        'state'    => $user->state?->name ?? '',
        'city'     => $user->citie?->name ?? '',
        'postcode' => $user->postcode?->name ?? '',
    ]);
}

    /** Detach + delete an additional guardian belonging to this parent's children. */
    public function destroyGuardian(Request $request, $guardian)
{
    $parent = $request->user();

    // $guardian = guardians.id
    $guardianRecord = DB::table('guardians')
        ->where('id', $guardian)
        ->first();

    if (! $guardianRecord) {
        return response()->json([
            'message' => 'Guardian not found.'
        ], 404);
    }

    // Find guardian account from users table using email
    $user = User::where('email', $guardianRecord->email)->first();

    if (! $user) {
        return response()->json([
            'message' => 'Guardian user account not found.'
        ], 404);
    }

    // Prevent logged-in parent from deleting themselves
    if ($user->id === $parent->id) {
        return response()->json([
            'message' => 'You cannot delete your own account.'
        ], 422);
    }

    DB::beginTransaction();

    try {
        $guardianEmail = $guardianRecord->email;

        // 1. Delete guardian/student relationships
        DB::table('guardians')
            ->where('email', $guardianEmail)
            ->delete();

        // 2. Delete guardian account from users table
        $user->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Guardian deleted successfully.'
        ]);

    } catch (\Throwable $e) {
        DB::rollBack();

        \Log::error('Guardian delete failed', [
            'guardian_id' => $guardian,
            'user_id'     => $user->id,
            'error'       => $e->getMessage(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Unable to delete guardian.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

    /* ---------------------------------------------------------------- */
    /* school                                                            */
    /* ---------------------------------------------------------------- */

    /** School reports (records table), same filters as the Blade page. */
    public function reports(Request $request)
    {
        $query = DB::table('records')
            ->leftJoin('students', 'records.card_id', '=', 'students.card_id')
            ->select(
                'records.card_id',
                'records.time',
                DB::raw('COALESCE(students.name, records.nama_pelajar) as student_name')
            );

        if ($request->filled('year')) {
            $query->whereYear('records.time', $request->year);
        }
        if ($request->filled('month')) {
            $query->whereMonth('records.time', $request->month);
        }
        if ($request->filled('date')) {
            $query->whereDate('records.time', $request->date);
        }

        return response()->json(
            $query->orderBy('records.time', 'desc')->limit(2000)->get()
        );
    }

    private function schoolId(Request $request): ?int
    {
        return $request->user()->school_id ? (int) $request->user()->school_id : null;
    }

    /** Class management: all grades + activated grades. */
    public function classManagement(Request $request)
    {
        $schoolId = $this->schoolId($request);

        $defaultGrades = [
            'Darjah 1', 'Darjah 2', 'Darjah 3',
            'Darjah 4', 'Darjah 5', 'Darjah 6',
            'Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3',
            'Tingkatan 4', 'Tingkatan 5', 'Tingkatan 6',
        ];

        $dbGrades = SchoolGrade::where('school_id', $schoolId)->pluck('grade_name')->toArray();
        $activated = SchoolGrade::where('school_id', $schoolId)
            ->where('is_active', true)
            ->pluck('grade_name')
            ->toArray();

        return response()->json([
            'allGrades'       => array_values(array_unique(array_merge($defaultGrades, $dbGrades))),
            'activatedGrades' => array_values($activated),
        ]);
    }

    public function activateGrade(Request $request)
    {
        $request->validate(['grade_name' => 'required|string|max:50']);

        $grade = SchoolGrade::firstOrCreate([
            'school_id'  => $this->schoolId($request),
            'grade_name' => $request->grade_name,
        ]);
        $grade->is_active = 1;
        $grade->save();

        return response()->json(['success' => true]);
    }

    public function addGrade(Request $request)
    {
        $request->validate(['grade_name' => 'required|string|max:50']);

        SchoolGrade::firstOrCreate(
            ['school_id' => $this->schoolId($request), 'grade_name' => $request->grade_name],
            ['is_active' => true]
        );

        return response()->json(['success' => 'Grade added successfully!']);
    }

    public function deactivateGrade(Request $request)
    {
        $request->validate(['grade_name' => 'required|string|max:50']);

        $grade = SchoolGrade::where('school_id', $this->schoolId($request))
            ->where('grade_name', $request->grade_name)
            ->first();

        if ($grade) {
            $grade->is_active = false;
            $grade->save();
        }

        return response()->json(['success' => true]);
    }

    public function exportAttendance(Request $request)
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AttendancesExport($request->user()->id),
            'student_attendance.xlsx'
        );
    }
}
