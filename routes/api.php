<?php

use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReceiveController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\SsoController;
use App\Http\Controllers\EwalletController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::post('register' , RegisterController::class);
Route::get('student/{student_id}' , [StudentController::class , 'index']);
Route::get('user/{user_id}' , [UserController::class , 'index']);
Route::post('/receive', [ReceiveController::class, 'store'])->name('receive.store');
Route::post('/chat/ask', [ChatController::class, 'ask']);
Route::get('/ewallet/parent-by-email', [
    EwalletController::class,
    'getParentByEmail'
]);


/*
|--------------------------------------------------------------------------
| Portal JSON API (React frontend)
|--------------------------------------------------------------------------
| Additive endpoints only - the existing Blade routes are unchanged.
*/

Route::post('/portal/register', [
    \App\Http\Controllers\Api\PortalController::class,
    'register'
]);

Route::get('/portal/get-students-by-parent-ic', [
    \App\Http\Controllers\Api\PortalController::class,
    'getStudentsByParentIc'
]);

Route::post('portal/login', [\App\Http\Controllers\Api\PortalController::class, 'login']);

Route::middleware(['auth:sanctum'])->prefix('portal')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\PortalController::class, 'logout']);

    /* forms previously posting to Blade web routes */
    Route::get('/profile/edit', [\App\Http\Controllers\Api\PortalFormsController::class, 'profileEdit']);
    Route::post('/profile/update', [\App\Http\Controllers\Api\PortalFormsController::class, 'profileUpdate']);
    Route::post('/profile/guardian', [\App\Http\Controllers\Api\PortalFormsController::class, 'guardianStore']);
    Route::get('/profile/guardian/{guardian}/edit', [\App\Http\Controllers\Api\PortalFormsController::class, 'guardianEdit']);
    Route::put('/profile/guardian/{guardian}', [\App\Http\Controllers\Api\PortalFormsController::class, 'guardianUpdate']);

    Route::get('/remarks/{attendance}', [\App\Http\Controllers\Api\PortalFormsController::class, 'showRemarks']);
    Route::post('/remarks/{attendance}', [\App\Http\Controllers\Api\PortalFormsController::class, 'saveRemarks']);

    Route::get('/class-names', [\App\Http\Controllers\Api\PortalFormsController::class, 'classNames']);
    Route::post('/class-names', [\App\Http\Controllers\Api\PortalFormsController::class, 'updateClassNames']);
    Route::post('/students/import', [\App\Http\Controllers\Api\PortalFormsController::class, 'importStudents']);

    Route::get('/students/{student}/attendance', [\App\Http\Controllers\Api\PortalFormsController::class, 'studentAttendance']);
    Route::get('/schools/{school}/students/management', [\App\Http\Controllers\Api\PortalFormsController::class, 'studentManagement']);
    Route::get('/class-attendance/{id}/show', [\App\Http\Controllers\Api\PortalFormsController::class, 'classAttendanceShow']);

    Route::get('/teachers/{teacher}/edit', [\App\Http\Controllers\Api\PortalFormsController::class, 'teacherEdit']);
    Route::put('/teachers/{teacher}/toggle', [\App\Http\Controllers\Api\PortalFormsController::class, 'teacherToggle']);
    Route::put('/teachers/{teacher}/classes', [\App\Http\Controllers\Api\PortalFormsController::class, 'teacherSyncClasses']);

    Route::get('/me', [\App\Http\Controllers\Api\PortalController::class, 'me']);
    Route::get('/dashboard', [\App\Http\Controllers\Api\PortalController::class, 'dashboard']);

    Route::middleware(['role:admin'])->group(function () {
        Route::get('/users', [\App\Http\Controllers\Api\PortalAdminController::class, 'users']);
        Route::post('/users', [\App\Http\Controllers\Api\PortalAdminController::class, 'storeUser']);
        Route::get('/users/{user}', [\App\Http\Controllers\Api\PortalAdminController::class, 'showUser']);
        Route::put('/users/{user}', [\App\Http\Controllers\Api\PortalAdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [\App\Http\Controllers\Api\PortalAdminController::class, 'destroyUser']);

        Route::post('/schools', [\App\Http\Controllers\Api\PortalAdminController::class, 'storeSchool']);
        Route::put('/schools/{school}', [\App\Http\Controllers\Api\PortalAdminController::class, 'updateSchool']);
        Route::delete('/schools/{school}', [\App\Http\Controllers\Api\PortalAdminController::class, 'destroySchool']);
    });

    Route::get('/schools', [\App\Http\Controllers\Api\PortalAdminController::class, 'schools']);

    /* dashboards */
    Route::get('/teacher/dashboard', [\App\Http\Controllers\Api\PortalDataController::class, 'teacherDashboard']);
    Route::get('/school/dashboard/{school?}', [\App\Http\Controllers\Api\PortalDataController::class, 'schoolDashboard']);
    Route::get('/ppd/{ppd?}', [\App\Http\Controllers\Api\PortalDataController::class, 'ppdDashboard']);
    Route::get('/state/{state?}', [\App\Http\Controllers\Api\PortalDataController::class, 'stateDashboard']);
    Route::get('/country', [\App\Http\Controllers\Api\PortalDataController::class, 'countryDashboard']);

    /* students */
    Route::get('/students', [\App\Http\Controllers\Api\PortalDataController::class, 'students']);
    Route::post('/students', [\App\Http\Controllers\Api\PortalDataController::class, 'storeStudent']);
    Route::post('/students/remarks', [\App\Http\Controllers\Api\PortalDataController::class, 'storeRemarks']);
    Route::get('/students/{student}', [\App\Http\Controllers\Api\PortalDataController::class, 'showStudent']);
    Route::put('/students/{student}', [\App\Http\Controllers\Api\PortalDataController::class, 'updateStudent']);
    Route::delete('/students/{student}', [\App\Http\Controllers\Api\PortalDataController::class, 'destroyStudent']);

    /* class attendance */
    Route::get('/class-attendance', [\App\Http\Controllers\Api\PortalDataController::class, 'classAttendance']);
    Route::post('/class-attendance', [\App\Http\Controllers\Api\PortalDataController::class, 'saveClassAttendance']);

    /* parent */
    Route::get('/parent/dashboard', [\App\Http\Controllers\Api\PortalParentController::class, 'dashboard']);
    Route::get('/parent/attendance', [\App\Http\Controllers\Api\PortalParentController::class, 'attendance']);
    Route::get('/profile', [\App\Http\Controllers\Api\PortalParentController::class, 'profile']);
    Route::get('/profile/guardian/{guardian}', [\App\Http\Controllers\Api\PortalParentController::class, 'showGuardian']);
    Route::delete('/profile/guardian/{guardian}', [\App\Http\Controllers\Api\PortalParentController::class, 'destroyGuardian']);

    /* school reports + class management */
    Route::get('/school/reports', [\App\Http\Controllers\Api\PortalParentController::class, 'reports']);
    Route::get('/school/class-management', [\App\Http\Controllers\Api\PortalParentController::class, 'classManagement']);
    Route::post('/school/grades/activate', [\App\Http\Controllers\Api\PortalParentController::class, 'activateGrade']);
    Route::post('/school/grades/add', [\App\Http\Controllers\Api\PortalParentController::class, 'addGrade']);
    Route::post('/school/grades/deactivate', [\App\Http\Controllers\Api\PortalParentController::class, 'deactivateGrade']);

    Route::middleware(['role:admin|school'])->group(function () {
        Route::get('/teachers', [\App\Http\Controllers\Api\PortalAdminController::class, 'teachers']);
        Route::post('/teachers', [\App\Http\Controllers\Api\PortalAdminController::class, 'storeTeacher']);
        Route::put('/teachers/{teacher}', [\App\Http\Controllers\Api\PortalAdminController::class, 'updateTeacher']);
        Route::delete('/teachers/{teacher}', [\App\Http\Controllers\Api\PortalAdminController::class, 'destroyTeacher']);
    });
});
