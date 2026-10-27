<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\Student;
use App\Services\CbsService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Http\Controllers\RegisteredUserController as FortifyRegisteredUserController;

class CustomRegisteredUserController extends FortifyRegisteredUserController
{
    public function store(
        Request $request,
        CreatesNewUsers $creator
    ): RegisterResponse {

        $relationships = [
            'Father',
            'Mother',
            'Guardian 1',
            'Guardian 2',
        ];

        // Validate main parent and additional guardians.
        $validator = Validator::make($request->all(), [
            'relationship' => [
                'required',
                'in:Father,Mother,Guardian 1,Guardian 2',
            ],

            'guardians' => [
                'sometimes',
                'array',
                'max:3',
            ],

            'guardians.*.name' => [
                'required',
                'string',
                'max:255',
            ],

            'guardians.*.email' => [
                'required',
                'email',
                'distinct',
                'unique:users,email',
            ],

            'guardians.*.username' => [
                'required',
                'string',
                'distinct',
                'unique:users,username',
            ],

            'guardians.*.relationship' => [
                'required',
                'in:Father,Mother,Guardian 1,Guardian 2',
                'distinct',
            ],

            'guardians.*.password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        // Check that main parent and additional guardians
        // do not share the same relationship.
        $validator->after(function ($validator) use ($request, $relationships) {

            $usedRelationships = [];
            $guardians = $request->input('guardians', []);

            $allRelationships = array_merge(
                [$request->input('relationship')],
                array_column($guardians, 'relationship')
            );

            foreach ($allRelationships as $index => $relationship) {

                if (!in_array($relationship, $relationships, true)) {
                    continue;
                }

                if (in_array($relationship, $usedRelationships, true)) {
                    $validator->errors()->add(
                        $index === 0
                            ? 'relationship'
                            : 'guardians.' . ($index - 1) . '.relationship',
                        "The relationship {$relationship} has already been selected."
                    );
                }

                $usedRelationships[] = $relationship;
            }
        });

        $validator->validate();

        DB::beginTransaction();

        try {

            // 1. Create main parent.
            $user = $creator->create($request->all());

            $user->assignRole('parent');

            // Main parent is the first guardian.
            $guardianIds = [$user->id];

            // 2. Create additional guardians.
            foreach ($request->input('guardians', []) as $guardianData) {

                $guardian = new User();

                $guardian->name = $guardianData['name'];
                $guardian->username = $guardianData['username'];
                $guardian->email = $guardianData['email'];
                $guardian->phone_num = $guardianData['phone_num'] ?? null;
                $guardian->ic = $guardianData['ic'] ?? null;
                $guardian->relationship = $guardianData['relationship'];
                $guardian->occupation = $guardianData['occupation'] ?? null;
                $guardian->address = $guardianData['address'] ?? null;
                $guardian->state_id = $guardianData['state_id'] ?? null;
                $guardian->postcode_id = $guardianData['postcode_id'] ?? null;
                $guardian->citie_id = $guardianData['citie_id'] ?? null;

                $guardian->password = Hash::make(
                    $guardianData['password']
                );

                $guardian->save();

                $guardian->assignRole('parent');

                $guardianIds[] = $guardian->id;
            }

            // 3. Create students and link guardians.
            if ($request->has('students')) {

                foreach ($request->input('students') as $studentData) {

                    $student = new Student();

                    $student->name = $studentData['name'] ?? null;
                    $student->ic = $studentData['ic'] ?? null;
                    $student->birth_cert_no = $studentData['birth_cert_no'] ?? null;
                    $student->dob = $studentData['dob'] ?? null;

                    $student->age = !empty($studentData['dob'])
                        ? Carbon::parse($studentData['dob'])->age
                        : null;

                    $student->grade = $studentData['grade'] ?? null;
                    $student->class_name = $studentData['class_name'] ?? null;
                    $student->gender = $studentData['gender'] ?? null;
                    $student->race = $studentData['race'] ?? null;
                    $student->religion = $studentData['religion'] ?? null;
                    $student->nationality = $studentData['nationality'] ?? null;
                    $student->orphan = $studentData['orphan'] ?? null;
                    $student->address = $studentData['address'] ?? null;
                    $student->oku = $studentData['oku'] ?? null;
                    $student->state_id = $studentData['state'] ?? null;
                    $student->district_id = $studentData['district'] ?? null;
                    $student->school_id = $studentData['school'] ?? null;
                    $student->session = $studentData['session'] ?? null;

                    $student->save();

                    // Link main parent + additional guardians.
                    $student->guardians()->attach($guardianIds);
                }
            }

            DB::commit();

            Auth::login($user);

            // Synchronize main parent with CBS.
            try {
                app(CbsService::class)->syncUser($user);
            } catch (\Throwable $e) {
                \Log::error('CBS synchronization pending', [
                    'skoola_user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }

        } catch (\Throwable $e) {

            DB::rollBack();

            throw $e;
        }

        // 4. Redirect parent.
        if ($user->hasRole('parent')) {

            return new class implements RegisterResponse {

                public function toResponse($request)
                {
                    return redirect('/parent/dashboard');
                }
            };
        }

        return app(RegisterResponse::class);
    }
}