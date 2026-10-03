<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Imports\StudentsImport;
use App\Models\SchoolClass;
use App\Models\SchoolGrade;
use App\Models\StudentRemark;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;

/**
 * JSON endpoints backing the React forms that previously posted to Blade
 * web routes (profile, guardians, class names, student import, teachers).
 * Additive only - no schema or existing controller changes.
 */
class PortalFormsController extends Controller
{
    private function serializeUser(User $u): array
    {
        return [
            'id'           => $u->id,
            'name'         => $u->name,
            'username'     => $u->username,
            'email'        => $u->email,
            'ic'           => $u->ic,
            'phone_num'    => $u->phone_num,
            'occupation'   => $u->occupation,
            'relationship' => $u->relationship,
            'address'      => $u->address,
            'status'       => $u->status,
            'school_id'    => $u->school_id,
        ];
    }

    /* ------------------------------ profile ----------------------------- */

    public function profileEdit(Request $request)
    {
        return response()->json(['user' => $this->serializeUser($request->user())]);
    }

    public function profileUpdate(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'username'     => ['nullable', 'string', 'max:255'],
            'ic'           => ['nullable', 'string', 'max:255'],
            'phone_num'    => ['nullable', 'string', 'max:255'],
            'occupation'   => ['nullable', 'string', 'max:255'],
            'relationship' => ['nullable', 'string', 'max:255'],
            'address'      => ['nullable', 'string'],
            'password'     => ['nullable', 'string', 'min:8'],
        ]);

        $user->fill(collect($data)->except('password')->toArray());

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json(['user' => $this->serializeUser($user), 'success' => 'Profile updated.']);
    }

    /* ----------------------------- guardians ---------------------------- */

    private function guardianRules(?int $ignoreId = null): array
{
    return [
        'name' => [
            'required',
            'string',
            'max:255'
        ],

        'email' => [
            'required',
            'email',
            'max:255',
            Rule::unique('users', 'email')->ignore($ignoreId)
        ],

        'username' => [
            'nullable',
            'string',
            'max:255'
        ],

        'ic' => [
            'nullable',
            'string',
            'max:255'
        ],

        'phone_num' => [
            'nullable',
            'string',
            'max:255'
        ],

        'occupation' => [
            'nullable',
            'string',
            'max:255'
        ],

        'relationship' => [
            'nullable',
            'string',
            'max:255'
        ],

        'address' => [
            'nullable',
            'string'
        ],

        'password' => $ignoreId
            ? ['nullable', 'string', 'min:8']
            : ['required', 'string', 'min:8'],
    ];
}

    public function guardianStore(Request $request)
{
    $parent = $request->user();

    $data = $request->validate($this->guardianRules());

    DB::beginTransaction();

    try {

        // 1. Create guardian login account in users table
        $guardian = User::create([
            'name'         => $data['name'],
            'email'        => $data['email'],
            'username'     => $data['username'] ?? $data['email'],
            'ic'           => $data['ic'] ?? null,
            'phone_num'    => $data['phone_num'] ?? null,
            'occupation'   => $data['occupation'] ?? null,
            'relationship' => $data['relationship'] ?? null,
            'address'      => $data['address'] ?? null,
            'password'     => Hash::make($data['password']),
        ]);

        $guardian->syncRoles(['parent']);

        /*
         * 2. Find ONLY the children belonging to the
         *    currently logged-in parent.
         *
         * We use the guardians table as the source of truth.
         */
        $studentIds = DB::table('guardians')
            ->where('ic', $parent->ic)
            ->pluck('student_id')
            ->filter()
            ->unique();

        /*
         * Fallback for existing parents that may not yet
         * have a guardians-table record.
         */
        if ($studentIds->isEmpty()) {
            $studentIds = $parent->students()
                ->pluck('students.id')
                ->filter()
                ->unique();
        }

        // 3. Link new user account to those students
        if ($studentIds->isNotEmpty()) {
            $guardian->extraStudents()
                ->syncWithoutDetaching($studentIds->toArray());
        }

        // 4. Insert guardian into guardians table
        foreach ($studentIds as $studentId) {

            DB::table('guardians')->updateOrInsert(
                [
                    'student_id' => $studentId,
                    'ic'         => $data['ic'] ?? null,
                ],
                [
                    'type'  => $data['relationship'] ?? 'Guardian',
                    'name'  => $data['name'],
                    'phone' => $data['phone_num'] ?? null,
                    'email' => $data['email'],
                ]
            );
        }

        DB::commit();

        return response()->json([
            'guardian' => $this->serializeUser($guardian),
            'success'  => 'Guardian added.',
        ], 201);

    } catch (\Throwable $e) {

        DB::rollBack();

        \Log::error('Unable to create guardian', [
            'message' => $e->getMessage(),
        ]);

        return response()->json([
            'message' => 'Unable to add guardian.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}

    public function guardianEdit(Request $request, $guardian)
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

    // Link guardians -> users through email
    $user = User::where('email', $guardianRecord->email)->first();

    if (! $user) {
        return response()->json([
            'message' => 'Guardian user account not found.'
        ], 404);
    }

    // DISPLAY DETAILS FROM USERS TABLE
    return response()->json([
        'guardian' => [
            // Keep guardian table ID for navigation/update
            'id'           => $guardianRecord->id,

            // Details below come from users table
            'name'         => $user->name,
            'username'     => $user->username,
            'ic'           => $user->ic,
            'phone_num'    => $user->phone_num,
            'email'        => $user->email,
            'occupation'   => $user->occupation,
            'relationship' => $user->relationship,
            'address'      => $user->address,
        ],

        'state'    => $user->state?->name ?? '',
        'city'     => $user->citie?->name ?? '',
        'postcode' => $user->postcode?->name ?? '',
    ]);
}
    public function guardianUpdate(Request $request, $guardian)
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

    // Find users account through guardians.email
    $user = User::where('email', $guardianRecord->email)->first();

    if (! $user) {
        return response()->json([
            'message' => 'Guardian user account not found.'
        ], 404);
    }

    $data = $request->validate([
        'name'         => ['required', 'string', 'max:255'],
        'email'        => [
            'required',
            'email',
            'max:255',
            Rule::unique('users', 'email')->ignore($user->id),
        ],
        'username'     => ['nullable', 'string', 'max:255'],
        'ic'           => ['nullable', 'string', 'max:255'],
        'phone_num'    => ['nullable', 'string', 'max:255'],
        'occupation'   => ['nullable', 'string', 'max:255'],
        'relationship' => ['nullable', 'string', 'max:255'],
        'address'      => ['nullable', 'string'],
        'password'     => ['nullable', 'string', 'min:8'],
    ]);

    DB::beginTransaction();

    try {

        // =====================================
        // 1. UPDATE USERS TABLE
        // =====================================

        $user->name = $data['name'];
        $user->username = $data['username'] ?? $user->username;
        $user->ic = $data['ic'] ?? null;
        $user->phone_num = $data['phone_num'] ?? null;
        $user->email = $data['email'];
        $user->occupation = $data['occupation'] ?? null;
        $user->relationship = $data['relationship'] ?? null;
        $user->address = $data['address'] ?? null;

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();


        // =====================================
        // 2. UPDATE GUARDIANS TABLE
        // =====================================

        DB::table('guardians')
            ->where('id', $guardianRecord->id)
            ->update([
                'name'  => $data['name'],
                'ic'    => $data['ic'] ?? null,
                'phone' => $data['phone_num'] ?? null,
                'email' => $data['email'],
                'type'  => $data['relationship'] ?? 'Guardian',
            ]);


        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Guardian updated successfully.',
            'guardian' => [
                'id'           => $guardianRecord->id,
                'name'         => $user->name,
                'username'     => $user->username,
                'ic'           => $user->ic,
                'phone_num'    => $user->phone_num,
                'email'        => $user->email,
                'occupation'   => $user->occupation,
                'relationship' => $user->relationship,
                'address'      => $user->address,
            ],
        ]);

    } catch (\Throwable $e) {

        DB::rollBack();

        \Log::error('Guardian update failed', [
            'guardian_id' => $guardianRecord->id,
            'user_id'     => $user->id,
            'error'       => $e->getMessage(),
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Unable to update guardian.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}
    /* ------------------------------ remarks ----------------------------- */

    public function showRemarks(Request $request, $student)
    {
        $remark = StudentRemark::where('student_id', $student)
            ->orderByDesc('date')
            ->first();

        return response()->json([
            'remarks'      => $remark?->remark_type ?? 'all',
            'remarksInput' => $remark?->remark_text ?? '',
        ]);
    }

    public function saveRemarks(Request $request, $student)
    {
        $data = $request->validate([
            'remarks'      => ['nullable', 'string', 'max:255'],
            'remarksInput' => ['nullable', 'string'],
        ]);

        StudentRemark::updateOrCreate(
            ['student_id' => $student, 'date' => now()->toDateString()],
            ['remark_type' => $data['remarks'] ?? null, 'remark_text' => $data['remarksInput'] ?? null],
        );

        return response()->json(['success' => 'Remarks saved.']);
    }

    /* --------------------------- class names ---------------------------- */

    /** Grades + their classes for the signed-in school. */
    public function classNames(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $grades = SchoolGrade::where('school_id', $schoolId)
            ->where('is_active', true)
            ->get()
            ->map(fn (SchoolGrade $g) => [
                'id'         => $g->id,
                'grade_name' => $g->grade_name,
                'classes'    => SchoolClass::where('school_grade_id', $g->id)
                    ->get()
                    ->map(fn (SchoolClass $c) => ['id' => $c->id, 'class_name' => $c->class_name])
                    ->values(),
            ])
            ->values();

        return response()->json(['grades' => $grades]);
    }

    public function updateClassNames(Request $request)
    {
        foreach ((array) $request->input('class_name', []) as $classId => $name) {
            if ($name === null || $name === '') {
                continue;
            }
            SchoolClass::where('id', $classId)->update(['class_name' => $name]);
        }

        foreach ((array) $request->input('new_class', []) as $gradeId => $names) {
            foreach ((array) $names as $name) {
                if ($name === null || $name === '') {
                    continue;
                }
                SchoolClass::firstOrCreate(['school_grade_id' => $gradeId, 'class_name' => $name]);
            }
        }

        $deleted = array_filter((array) $request->input('delete_class', []));
        if ($deleted) {
            SchoolClass::whereIn('id', $deleted)->delete();
        }

        return response()->json(['success' => 'Class names updated successfully!']);
    }

    /* ------------------------------ import ------------------------------ */

    public function importStudents(Request $request)
    {
        $request->validate(['import_file' => ['required', 'file', 'mimes:xlsx,xls,csv']]);

        Excel::import(new StudentsImport, $request->file('import_file'));

        return response()->json(['success' => 'Import successful.']);
    }

    /* ------------------------- teacher edit view ------------------------ */

    public function teacherEdit(Request $request, User $teacher)
    {
        $schoolId = $request->user()->school_id;

        $gradeIds = SchoolGrade::where('school_id', $schoolId)->pluck('id');
        $classes = SchoolClass::whereIn('school_grade_id', $gradeIds)
            ->with('grade')
            ->get()
            ->map(fn (SchoolClass $c) => [
                'id'         => $c->id,
                'class_name' => $c->class_name,
                'grade'      => $c->grade ? ['grade_name' => $c->grade->grade_name] : null,
            ])
            ->values();

        return response()->json([
            'teacher' => array_merge($this->serializeUser($teacher), [
                'classes' => $teacher->classes()->pluck('school_classes.id')->toArray(),
            ]),
            'classes' => $classes,
        ]);
    }

    public function teacherToggle(Request $request, User $teacher)
    {
        $teacher->status = $teacher->status === 'active' ? 'inactive' : 'active';
        $teacher->save();

        return response()->json(['success' => 'Status updated.', 'status' => $teacher->status]);
    }

    public function teacherSyncClasses(Request $request, User $teacher)
    {
        $classes = array_filter((array) $request->input('classes', []));
        $teacher->classes()->sync($classes);

        return response()->json(['success' => 'Classes updated.']);
    }

    /* ------------------- student attendance (school view) ---------------- */

    public function studentAttendance(Request $request, $studentId)
    {
        $student = \App\Models\Student::findOrFail($studentId);

        $attendanceList = \App\Models\Attendance::where('student_id', $studentId)
            ->orderByDesc('id')
            ->get()
            ->map(fn ($a) => [
                'date'      => $a->date ?? $a->created_at?->toDateString(),
                'check_in'  => $a->check_in ?? null,
                'check_out' => $a->check_out ?? null,
                'status'    => $a->status,
                'remarks'   => $a->remarks ?? null,
                'student'   => ['name' => $student->name, 'school' => ['name' => $student->school?->name]],
            ])
            ->values();

        return response()->json([
            'student'        => ['id' => $student->id, 'name' => $student->name],
            'attendanceList' => $attendanceList,
        ]);
    }

    /* --------------------- school student management --------------------- */

    public function studentManagement(Request $request, $school)
    {
        $schoolModel = \App\Models\School::findOrFail($school);

        $students = \App\Models\Student::where('school_id', $schoolModel->id)
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => [
                'id'         => $s->id,
                'name'       => $s->name,
                'ic'         => $s->ic,
                'grade'      => $s->grade,
                'class_name' => $s->class_name,
                'status'     => $s->status,
            ])
            ->values();

        return response()->json([
            'school'   => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'students' => $students,
        ]);
    }

    /* ---------------------- class attendance (show) ---------------------- */

    public function classAttendanceShow(Request $request, $id)
    {
        $class = \App\Models\ClassAttendance::findOrFail($id);

        $students = \App\Models\Student::where('class_name', $class->class_name)
            ->where('grade', $class->grade)
            ->orderBy('name')
            ->get()
            ->map(fn ($s) => ['id' => $s->id, 'name' => $s->name])
            ->values();

        return response()->json([
            'class' => [
                'subject' => $class->subject,
                'class'   => trim(($class->grade ?? '').' '.($class->class_name ?? '')),
                'day'     => optional($class->attendance_time ? \Carbon\Carbon::parse($class->attendance_time) : null)?->format('l') ?? '',
                'start'   => optional($class->attendance_time ? \Carbon\Carbon::parse($class->attendance_time) : null)?->format('H:i') ?? '',
                'end'     => '',
            ],
            'students' => $students,
        ]);
    }
}
