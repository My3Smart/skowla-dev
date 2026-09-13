<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\User;
use Illuminate\Http\Request;

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
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])
            ->orWhere('username', $data['email'])
            ->first();

        if (! $user || ! \Illuminate\Support\Facades\Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'These credentials do not match our records.',
                'errors'  => ['email' => ['These credentials do not match our records.']],
            ], 422);
        }

        $token = $user->createToken('portal-spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'school_id' => $user->school_id,
                'roles'     => $user->getRoleNames(),
                'role'      => $user->getRoleNames()->first(),
            ],
        ]);
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
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'phone_num'  => $user->phone_num,
            'ic'         => $user->ic,
            'school_id'  => $user->school_id,
            'state_id'   => $user->state_id,
            'roles'      => $user->getRoleNames(),
            'role'       => $user->getRoleNames()->first(),
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
            'role'           => $role,
            'total_students' => $totalStudents,
            'total_schools'  => School::count(),
            'total_users'    => User::count(),
            'present_today'  => $presentToday,
            'absent_today'   => max($totalStudents - $presentToday, 0),
        ]);
    }
}
