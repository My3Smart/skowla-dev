<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\ClassAttendance;
use App\Models\District;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\State;
use App\Models\Student;
use App\Models\StudentRemark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Guardian;
use Carbon\Carbon;

/**
 * Additive JSON endpoints for the React portal.
 * Reuses the existing Eloquent models / database - no schema or Blade changes.
 */
class PortalDataController extends Controller
{
    /* ---------------------------------------------------------------- */
    /* helpers                                                          */
    /* ---------------------------------------------------------------- */

    /** Average attendance percentage over a set of student ids. */
    private function attendancePercentage($studentIds): float
    {
        $studentIds = collect($studentIds)->filter()->values();
        if ($studentIds->isEmpty()) {
            return 0.0;
        }

        $rows = Attendance::whereIn('student_id', $studentIds)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $attend = (int) ($rows['attend'] ?? 0);
        $absent = (int) ($rows['absent'] ?? 0);
        $total  = $attend + $absent;

        return $total > 0 ? round(($attend / $total) * 100, 1) : 0.0;
    }

    private function schoolPercentage(int $schoolId): float
    {
        return $this->attendancePercentage(
            Student::where('school_id', $schoolId)->pluck('id')
        );
    }

    private function userMeta($user, string $key)
    {
        try {
            return $user->getMeta($key);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /* ---------------------------------------------------------------- */
    /* dashboards                                                       */
    /* ---------------------------------------------------------------- */

    /** Teacher dashboard: assigned classes + present/absent/others per period. */
    public function teacherDashboard(Request $request)
    {
        $user = $request->user();

        $assigned = DB::table('class_user')
            ->join('school_classes', 'class_user.school_class_id', '=', 'school_classes.id')
            ->join('school_grades', 'school_classes.school_grade_id', '=', 'school_grades.id')
            ->where('class_user.user_id', $user->id)
            ->select('school_classes.class_name', 'school_grades.grade_name')
            ->get();

        $classes = [];
        $attendanceData = [];

        foreach ($assigned as $class) {
            $classes[$class->class_name] = $class->grade_name;

            $base = ClassAttendance::where('grade', $class->grade_name)
                ->where('class_name', $class->class_name);

            if (! (clone $base)->exists()) {
                $attendanceData[$class->class_name] = null;
                continue;
            }

            $counts = function ($query) {
                $present = (clone $query)->where('status', 'Present')->count();
                $absent  = (clone $query)->where('status', 'Absent')->count();
                $total   = (clone $query)->count();

                return [$present, $absent, max($total - $present - $absent, 0)];
            };

            $attendanceData[$class->class_name] = [
                'daily'   => $counts((clone $base)->whereDate('attendance_time', now())),
                'weekly'  => $counts((clone $base)->whereBetween('attendance_time', [now()->startOfWeek(), now()->endOfWeek()])),
                'monthly' => $counts((clone $base)->whereMonth('attendance_time', now()->month)),
            ];
        }

        return response()->json([
            'classes'        => (object) $classes,
            'attendanceData' => (object) $attendanceData,
        ]);
    }

    /** School dashboard totals. */
    public function schoolDashboard(Request $request, $school = null)
    {
        $user = $request->user();
        $schoolId = (int) ($school ?: $user->school_id ?: $this->userMeta($user, 'user_school_id'));

        if (! $schoolId) {
            return response()->json(['totalPelajar' => 0, 'formattedAttendancePercentageSchool' => 0, 'school_id' => null]);
        }

        $model = School::find($schoolId);

        return response()->json([
            'school_id'                           => $schoolId,
            'school_name'                         => $model?->name,
            'totalPelajar'                        => Student::where('school_id', $schoolId)->count(),
            'formattedAttendancePercentageSchool' => $this->schoolPercentage($schoolId),
        ]);
    }

    /** PPD (district) dashboard. */
    public function ppdDashboard(Request $request, $ppd = null)
    {
        $user = $request->user();
        $districtId = (int) ($ppd ?: $this->userMeta($user, 'user_district_id'));
        $district = District::find($districtId);

        if (! $district) {
            return response()->json(['schools' => [], 'totalPelajarPPD' => 0, 'formattedAttendancePercentagePPD' => 0]);
        }

        $schools = School::where('district_id', $district->id)->orderBy('name')->get()
            ->map(fn (School $s) => [
                'id'                 => $s->id,
                'name'               => $s->name,
                'totalStudents'      => Student::where('school_id', $s->id)->count(),
                'attendancePercent'  => $this->schoolPercentage($s->id),
            ]);

        $studentIds = Student::whereIn('school_id', $schools->pluck('id'))->pluck('id');

        return response()->json([
            'ppd'                             => ['ppd' => $district->ppd],
            'ppd_id'                          => $district->id,
            'totalPelajarPPD'                 => $studentIds->count(),
            'formattedAttendancePercentagePPD'=> $this->attendancePercentage($studentIds),
            'schools'                         => $schools,
        ]);
    }

    /** State dashboard. */
    public function stateDashboard(Request $request, $state = null)
    {
        $user = $request->user();
        $stateId = (int) ($state ?: $this->userMeta($user, 'user_state_id') ?: $user->state_id);
        $model = State::find($stateId);

        if (! $model) {
            return response()->json(['districts' => [], 'totalPelajar' => 0, 'formattedAttendancePercentageState' => 0]);
        }

        $districts = District::where('state_id', $model->id)->orderBy('ppd')->get()
            ->map(function (District $d) {
                $ids = Student::whereIn('school_id', School::where('district_id', $d->id)->pluck('id'))->pluck('id');

                return [
                    'id'                => $d->id,
                    'ppd'               => $d->ppd,
                    'totalStudents'     => $ids->count(),
                    'attendancePercent' => $this->attendancePercentage($ids),
                ];
            });

        $studentIds = Student::where('state_id', $model->id)->pluck('id');

        return response()->json([
            'state'                             => ['name' => $model->name],
            'state_id'                          => $model->id,
            'totalPelajar'                      => $studentIds->count(),
            'formattedAttendancePercentageState'=> $this->attendancePercentage($studentIds),
            'districts'                         => $districts,
        ]);
    }

    /** Country dashboard: all states. */
    public function countryDashboard()
    {
        $states = State::orderBy('name')->get()->map(function (State $s) {
            $ids = Student::where('state_id', $s->id)->pluck('id');

            return [
                'id'                => $s->id,
                'name'              => $s->name,
                'totalStudents'     => $ids->count(),
                'attendancePercent' => $this->attendancePercentage($ids),
            ];
        });

        $allIds = Student::pluck('id');

        return response()->json([
            'states'                              => $states,
            'totalPelajar'                        => $allIds->count(),
            'formattedAttendancePercentageCountry' => $this->attendancePercentage($allIds),
        ]);
    }

    /* ---------------------------------------------------------------- */
    /* students                                                         */
    /* ---------------------------------------------------------------- */

    private function serializeStudent(Student $s): array
    {
        return [
            'id'            => $s->id,
            'name'          => $s->name,
            'ic'            => $s->ic,
            'birth_cert_no' => $s->birth_cert_no,
            'dob'           => $s->dob,
            'gender'        => $s->gender,
            'grade'         => $s->grade,
            'class_name'    => $s->class_name,
            'race'          => $s->race,
            'religion'      => $s->religion,
            'nationality'   => $s->nationality,
            'address'       => $s->address,
            'age'           => $s->age,
            'status'        => $s->status,
            'session'       => $s->session,
            'state_id'      => $s->state_id,
            'district_id'   => $s->district_id,
            'school_id'     => $s->school_id,
            'school_name'   => $s->school?->name,
        ];
    }

    /** Students visible to the signed-in user (parents see their own children). */
    public function students(Request $request)
    {
        $user = $request->user();
        $query = Student::query()->with('school');

        if ($user->hasRole('parent')) {
            $query->whereHas('parents', fn ($q) => $q->where('users.id', $user->id));
        } elseif ($user->hasRole('school|teacher')) {
            $schoolId = $user->school_id ?: $this->userMeta($user, 'user_school_id');
            if ($schoolId) {
                $query->where('school_id', $schoolId);
            }
        }

        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('ic', 'like', "%{$search}%"));
        }
        if ($grade = $request->query('grade')) {
            $query->where('grade', $grade);
        }
        if ($className = $request->query('class_name')) {
            $query->where('class_name', $className);
        }
        if ($schoolId = $request->query('school_id')) {
            $query->where('school_id', $schoolId);
        }

        return response()->json([
            'students' => $query->orderBy('name')->get()->map(fn (Student $s) => $this->serializeStudent($s)),
        ]);
    }

    public function showStudent(Student $student)
    {
        return response()->json(['student' => $this->serializeStudent($student->load('school'))]);
    }

    private function studentRules(): array
{
    return [
        // Student
        'name'          => ['required', 'string', 'max:255'],
        'ic'            => ['nullable', 'string', 'max:255'],
        'birth_cert_no' => ['nullable', 'string', 'max:255'],
        'dob'           => ['nullable', 'date'],
        'gender'        => ['nullable', 'string', 'max:50'],
        'grade'         => ['nullable', 'string', 'max:100'],
        'class_name'    => ['nullable', 'string', 'max:100'],
        'race'          => ['nullable', 'string', 'max:100'],
        'religion'      => ['nullable', 'string', 'max:100'],
        'nationality'   => ['nullable', 'string', 'max:100'],
        'address'       => ['nullable', 'string'],
        'age'           => ['nullable', 'integer'],
        'session'       => ['nullable', 'string', 'max:100'],
        'status'        => ['nullable', 'string', 'max:100'],
        'state_id'      => ['nullable', 'exists:states,id'],
        'district_id'   => ['nullable', 'exists:districts,id'],
        'school_id'     => ['nullable', 'exists:schools,id'],

        // Extra student fields
        'orphan'        => ['nullable', 'string', 'max:20'],
        'oku'           => ['nullable', 'string', 'max:20'],

        // Father
        'father_name'   => ['nullable', 'string', 'max:255'],
        'father_ic'     => ['nullable', 'string', 'max:255'],
        'father_phone'  => ['nullable', 'string', 'max:50'],
        'father_email'  => ['nullable', 'email', 'max:255'],

        // Mother
        'mother_name'   => ['nullable', 'string', 'max:255'],
        'mother_ic'     => ['nullable', 'string', 'max:255'],
        'mother_phone'  => ['nullable', 'string', 'max:50'],
        'mother_email'  => ['nullable', 'email', 'max:255'],

        // Guardian
        'guardian_name'  => ['nullable', 'string', 'max:255'],
        'guardian_ic'    => ['nullable', 'string', 'max:255'],
        'guardian_phone' => ['nullable', 'string', 'max:50'],
        'guardian_email' => ['nullable', 'email', 'max:255'],
    ];
}

public function storeStudent(Request $request)
{
    $validated = $request->validate($this->studentRules());

    return DB::transaction(function () use ($request, $validated) {

        $user = $request->user();

        $studentData = collect($validated)->only([
            'name',
            'ic',
            'birth_cert_no',
            'dob',
            'gender',
            'grade',
            'class_name',
            'race',
            'religion',
            'nationality',
            'address',
            'age',
            'session',
            'status',
            'state_id',
            'district_id',
            'school_id',
            'orphan',
            'oku',
        ])->toArray();

        // Force school_id from logged-in school user
        if ($user->hasRole('school')) {
            $studentData['school_id'] = $user->school_id;
        }

        // Calculate age from DOB if age wasn't submitted
        if (
            empty($studentData['age']) &&
            !empty($studentData['dob'])
        ) {
            $studentData['age'] = \Carbon\Carbon::parse(
                $studentData['dob']
            )->age;
        }

        $student = Student::create($studentData);

        if (!empty($validated['father_name'])) {
            Guardian::create([
                'student_id' => $student->id,
                'type'       => 'father',
                'name'       => $validated['father_name'],
                'ic'         => $validated['father_ic'] ?? null,
                'phone'      => $validated['father_phone'] ?? null,
                'email'      => $validated['father_email'] ?? null,
            ]);
        }

        if (!empty($validated['mother_name'])) {
            Guardian::create([
                'student_id' => $student->id,
                'type'       => 'mother',
                'name'       => $validated['mother_name'],
                'ic'         => $validated['mother_ic'] ?? null,
                'phone'      => $validated['mother_phone'] ?? null,
                'email'      => $validated['mother_email'] ?? null,
            ]);
        }

        if (!empty($validated['guardian_name'])) {
            Guardian::create([
                'student_id' => $student->id,
                'type'       => 'guardian',
                'name'       => $validated['guardian_name'],
                'ic'         => $validated['guardian_ic'] ?? null,
                'phone'      => $validated['guardian_phone'] ?? null,
                'email'      => $validated['guardian_email'] ?? null,
            ]);
        }

        if ($user->hasRole('parent')) {
            $student->parents()->syncWithoutDetaching([
                $user->id
            ]);
        }

        return response()->json([
            'student' => $this->serializeStudent($student),
            'success' => 'Student and guardian information saved.',
        ], 201);
    });
}

    public function updateStudent(Request $request, Student $student)
    {
        $student->update($request->validate($this->studentRules()));

        return response()->json(['student' => $this->serializeStudent($student), 'success' => 'Student updated.']);
    }

    public function destroyStudent(Student $student)
    {
        $student->delete();

        return response()->json(['success' => 'Student deleted.']);
    }

    /** Save movement remarks for a set of students. */
    public function storeRemarks(Request $request)
    {
        $remarks = $request->input('remarks', []);

        foreach ($remarks as $studentId => $remark) {
            if (empty($remark['type']) && empty($remark['text'])) {
                continue;
            }

            StudentRemark::updateOrCreate(
                ['student_id' => $studentId, 'date' => now()->toDateString()],
                ['remark_type' => $remark['type'] ?? null, 'remark_text' => $remark['text'] ?? null],
            );
        }

        return response()->json(['success' => 'Remarks saved successfully']);
    }

    /* ---------------------------------------------------------------- */
    /* class attendance                                                 */
    /* ---------------------------------------------------------------- */

    /** Filters + student list + recorded statuses for the attendance grid. */
    public function classAttendance(Request $request)
    {
        $user = $request->user();
        $schoolId = $user->school_id ?: $this->userMeta($user, 'user_school_id');

        $classes = SchoolClass::with('grade')->get()->map(fn (SchoolClass $c) => [
            'class_name' => $c->class_name,
            'grade'      => ['grade_name' => $c->grade?->grade_name],
        ])->values();

        $grades = $classes->pluck('grade.grade_name')->filter()->unique()->values();

        $grade   = $request->query('grade');
        $class   = $request->query('class_name');
        $subject = $request->query('subject');

        $payload = [
            'grades'          => $grades,
            'classes'         => $classes,
            'selectedGrade'   => $grade,
            'selectedClass'   => $class,
            'selectedSubject' => $subject,
        ];

        if (! $grade || ! $class) {
            return response()->json($payload + ['students' => [], 'attendanceRecords' => (object) [], 'subjectOrder' => (object) []]);
        }

        $studentsQuery = Student::where('grade', $grade)->where('class_name', $class);
        if ($schoolId) {
            $studentsQuery->where('school_id', $schoolId);
        }
        $students = $studentsQuery->orderBy('name')->get(['id', 'name']);

        $records = ClassAttendance::where('grade', $grade)
            ->where('class_name', $class)
            ->whereIn('student_id', $students->pluck('id'))
            ->whereDate('attendance_time', now()->toDateString())
            ->get();

        $attendanceRecords = [];
        foreach ($records as $record) {
            $attendanceRecords[$record->student_id][$record->subject] = $record->status;
        }

        $subjectOrder = [];
        foreach ($records->pluck('subject')->filter()->unique()->values() as $index => $subj) {
            $subjectOrder[$subj] = $index + 1;
        }
        if ($subject && ! isset($subjectOrder[$subject])) {
            $subjectOrder[$subject] = count($subjectOrder) + 1;
        }

        $existing = [];
        if ($subject) {
            foreach ($records->where('subject', $subject) as $record) {
                $existing[$record->student_id] = $record->status;
            }
        }

        return response()->json($payload + [
            'existingAttendance'   => (object) $existing,
            'students'             => $students,
            'attendanceRecords'    => (object) $attendanceRecords,
            'subjectOrder'         => (object) $subjectOrder,
            'teacherHasAttendance' => $records->where('teacher_id', $user->id)->isNotEmpty(),
        ]);
    }

    /** Create or update today's attendance for one class + subject. */
    public function saveClassAttendance(Request $request)
    {
        $data = $request->validate([
            'grade'      => ['required', 'string'],
            'class_name' => ['required', 'string'],
            'subject'    => ['required', 'string'],
            'attendance' => ['required', 'array'],
        ]);

        foreach ($data['attendance'] as $studentId => $status) {
            if ($status === null || $status === '') {
                continue;
            }

            ClassAttendance::updateOrCreate(
                [
                    'student_id' => $studentId,
                    'grade'      => $data['grade'],
                    'class_name' => $data['class_name'],
                    'subject'    => $data['subject'],
                    'teacher_id' => $request->user()->id,
                ],
                [
                    'status'          => $status,
                    'attendance_time' => now(),
                ],
            );
        }

        return response()->json(['success' => 'Attendance saved.']);
    }
}
