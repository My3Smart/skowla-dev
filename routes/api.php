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
Route::middleware(['auth:sanctum'])->prefix('portal')->group(function () {
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
