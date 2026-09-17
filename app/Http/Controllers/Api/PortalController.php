<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Guardian;
use App\Actions\Fortify\CreateNewUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Read-only JSON endpoints used by the React portal.
 * Existing Blade controllers are untouched.
 */
class PortalController extends Controller
{
    /**
     * Token login for the React portal. Works cross-origin without cookies,
     * so the SPA never hits a 401 from a missing session cookie.
     */

    public function register(Request $request, CreateNewUser $creator)
{
    $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'username' => ['required', 'string', 'max:255', 'unique:users,username'],
        'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        'phone_num' => ['required', 'string', 'max:255'],
        'ic' => ['required', 'string', 'size:12', 'unique:users,ic'],
        'address' => ['required', 'string'],
        'occupation' => ['required', 'string'],
        'relationship' => ['required', 'string'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],

        'guardians' => ['nullable', 'array'],
        'guardians.*.name' => ['nullable', 'string', 'max:255'],
        'guardians.*.username' => ['nullable', 'string', 'max:255'],
        'guardians.*.email' => ['nullable', 'email', 'max:255'],
        'guardians.*.phone_num' => ['nullable', 'string', 'max:255'],
        'guardians.*.ic' => ['nullable', 'string', 'max:255'],
        'guardians.*.relationship' => ['nullable', 'string', 'max:255'],
        'guardians.*.occupation' => ['nullable', 'string', 'max:255'],
        'guardians.*.address' => ['nullable', 'string'],
        'guardians.*.password' => ['nullable', 'string', 'min:8'],
    ]);

    return DB::transaction(function () use ($request, $creator) {

        /*
         * Create the main parent using the same Fortify
         * CreateNewUser action as the existing Blade registration.
         */
        $user = $creator->create($request->all());

        $user->assignRole('parent');

        /*
         * Create additional guardian user accounts.
         */
        $guardianUsers = [];

        foreach ($request->input('guardians', []) as $guardianData) {

            if (empty($guardianData['name'])) {
                continue;
            }

            $guardian = new User();

            $guardian->name = $guardianData['name'];
            $guardian->username = $guardianData['username'] ?? null;
            $guardian->email = $guardianData['email'] ?? null;
            $guardian->phone_num = $guardianData['phone_num'] ?? null;
            $guardian->ic = $guardianData['ic'] ?? null;
            $guardian->relationship = $guardianData['relationship'] ?? null;
            $guardian->occupation = $guardianData['occupation'] ?? null;
            $guardian->address = $guardianData['address'] ?? null;
            $guardian->state_id = $guardianData['state_id'] ?? null;
            $guardian->postcode_id = $guardianData['postcode_id'] ?? null;
            $guardian->citie_id = $guardianData['citie_id'] ?? null;

            $guardian->password = Hash::make(
                !empty($guardianData['password'])
                    ? $guardianData['password']
                    : 'default123'
            );

            $guardian->save();

            $guardian->assignRole('parent');

            $guardianUsers[] = $guardian;
        }

        

        return response()->json([
            'message' => 'Registration successful.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'ic' => $user->ic,
                'roles' => $user->getRoleNames(),
            ],
        ], 201);
    });
}
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])
            ->orWhere('username', $data['email'])
            ->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'These credentials do not match our records.',
                'errors' => ['email' => ['These credentials do not match our records.']],
            ], 422);
        }

        $token = $user->createToken('portal-spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'school_id' => $user->school_id,
                'roles' => $user->getRoleNames(),
                'role' => $user->getRoleNames()->first(),
            ],
        ]);
    }

    public function getStudentsByParentIc(Request $request)
    {
        $request->validate([
            'ic' => ['required', 'string', 'size:12'],
        ]);

        // Find all guardian records matching the parent's IC
        $studentIds = \App\Models\Guardian::where('ic', $request->ic)
            ->pluck('student_id')
            ->filter()
            ->unique();

        // No student linked to this IC
        if ($studentIds->isEmpty()) {
            return response()->json([]);
        }

        // Get the linked students
        $students = Student::whereIn('id', $studentIds)
            ->get()
            ->map(function ($student) {
                return [
                    'name' => $student->name,
                    'ic' => $student->ic,
                    'grade' => $student->grade,
                    'class_name' => $student->class_name,
                ];
            });

        return response()->json($students);
    }

    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();
        if ($token && method_exists($token, 'delete')) {
            $token->delete();
        }

        return response()->json(['success' => true]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone_num' => $user->phone_num,
            'ic' => $user->ic,
            'school_id' => $user->school_id,
            'state_id' => $user->state_id,
            'roles' => $user->getRoleNames(),
            'role' => $user->getRoleNames()->first(),
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $role = $user->getRoleNames()->first();

        $studentsQuery = Student::query();
        $attendanceQuery = StudentAttendance::query();

        if ($role === 'school' && $user->school_id) {
            $studentsQuery->where('school_id', $user->school_id);
            $attendanceQuery->where('school_id', $user->school_id);
        }

        $today = now()->toDateString();
        $totalStudents = (clone $studentsQuery)->count();
        $presentToday = (clone $attendanceQuery)->whereDate('created_at', $today)->count();

        return response()->json([
            'role' => $role,
            'total_students' => $totalStudents,
            'total_schools' => School::count(),
            'total_users' => User::count(),
            'present_today' => $presentToday,
            'absent_today' => max($totalStudents - $presentToday, 0),
        ]);
    }
}
