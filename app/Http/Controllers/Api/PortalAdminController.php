<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * JSON CRUD for the React admin pages (users, schools, teachers).
 * Uses the same Eloquent models and spatie roles as the Blade admin.
 */
class PortalAdminController extends Controller
{
    private function serializeUser(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'username'  => $user->username,
            'email'     => $user->email,
            'phone_num' => $user->phone_num,
            'ic'        => $user->ic,
            'status'    => $user->status,
            'school_id' => $user->school_id,
            'roles'     => $user->getRoleNames(),
        ];
    }

    /* ------------------------------ users ------------------------------ */

    public function users(Request $request)
    {
        $query = User::query()->with('roles');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_num', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->role($role);
        }

        $users = $query->orderByDesc('id')->get()
            ->map(fn (User $u) => $this->serializeUser($u));

        return response()->json(['users' => $users]);
    }

    public function showUser(User $user)
    {
        return response()->json(['user' => $this->serializeUser($user->load('roles'))]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_num' => ['nullable', 'string', 'max:255'],
            'ic'        => ['nullable', 'string', 'max:255'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'password'  => ['required', 'string', 'min:8'],
            'role'      => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name'      => $data['name'],
            'username'  => $data['email'],
            'email'     => $data['email'],
            'phone_num' => $data['phone_num'] ?? null,
            'ic'        => $data['ic'] ?? null,
            'school_id' => $data['school_id'] ?? null,
            'password'  => Hash::make($data['password']),
        ]);

        $user->syncRoles([$data['role']]);

        return response()->json(['user' => $this->serializeUser($user), 'success' => 'User created.'], 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone_num' => ['nullable', 'string', 'max:255'],
            'ic'        => ['nullable', 'string', 'max:255'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'password'  => ['nullable', 'string', 'min:8'],
            'role'      => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->fill([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone_num' => $data['phone_num'] ?? null,
            'ic'        => $data['ic'] ?? null,
            'school_id' => $data['school_id'] ?? null,
        ]);

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();
        $user->syncRoles([$data['role']]);

        return response()->json(['user' => $this->serializeUser($user), 'success' => 'User updated.']);
    }

    public function destroyUser(User $user)
    {
        $user->delete();

        return response()->json(['success' => 'User deleted.']);
    }

    /* ----------------------------- schools ----------------------------- */

    public function schools()
    {
        $schools = School::with(['state', 'district'])->orderBy('name')->get()
            ->map(fn (School $s) => [
                'id'          => $s->id,
                'name'        => $s->name,
                'state_id'    => $s->state_id,
                'district_id' => $s->district_id,
                'state'       => $s->state?->name,
                'district'    => $s->district?->name,
            ]);

        return response()->json(['schools' => $schools]);
    }

    public function storeSchool(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'state_id'    => ['nullable', 'exists:states,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
        ]);

        $school = School::create($data);

        return response()->json(['school' => $school, 'success' => 'School created.'], 201);
    }

    public function updateSchool(Request $request, School $school)
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'state_id'    => ['nullable', 'exists:states,id'],
            'district_id' => ['nullable', 'exists:districts,id'],
        ]);

        $school->update($data);

        return response()->json(['school' => $school, 'success' => 'School updated.']);
    }

    public function destroySchool(School $school)
    {
        $school->delete();

        return response()->json(['success' => 'School deleted.']);
    }

    /* ----------------------------- teachers ---------------------------- */

    public function teachers(Request $request)
    {
        $user = $request->user();

        $query = User::role('teacher')->with('roles');

        if ($user->hasRole('school')) {
            $query->where('school_id', $user->school_id);
        } elseif ($schoolId = $request->query('school_id')) {
            // Keep this for admin filtering by school if needed
            $query->where('school_id', $schoolId);
        }

        $teachers = $query
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => $this->serializeUser($u));

        return response()->json([
            'teachers' => $teachers,
        ]);
    }

    public function storeTeacher(Request $request)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone_num' => ['nullable', 'string', 'max:255'],
            'ic'        => ['nullable', 'string', 'max:255'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'password'  => ['required', 'string', 'min:8'],
        ]);

        $teacher = User::create([
            'name'      => $data['name'],
            'username'  => $data['email'],
            'email'     => $data['email'],
            'phone_num' => $data['phone_num'] ?? null,
            'ic'        => $data['ic'] ?? null,
            'school_id' => $data['school_id'] ?? $request->user()->school_id,
            'password'  => Hash::make($data['password']),
        ]);

        $teacher->syncRoles(['teacher']);

        return response()->json(['teacher' => $this->serializeUser($teacher), 'success' => 'Teacher created.'], 201);
    }

    public function updateTeacher(Request $request, User $teacher)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($teacher->id)],
            'phone_num' => ['nullable', 'string', 'max:255'],
            'ic'        => ['nullable', 'string', 'max:255'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'password'  => ['nullable', 'string', 'min:8'],
        ]);

        $teacher->fill([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'phone_num' => $data['phone_num'] ?? null,
            'ic'        => $data['ic'] ?? null,
            'school_id' => $data['school_id'] ?? $teacher->school_id,
        ]);

        if (! empty($data['password'])) {
            $teacher->password = Hash::make($data['password']);
        }

        $teacher->save();

        return response()->json(['teacher' => $this->serializeUser($teacher), 'success' => 'Teacher updated.']);
    }

    public function destroyTeacher(User $teacher)
    {
        $teacher->delete();

        return response()->json(['success' => 'Teacher deleted.']);
    }
}
