<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Student;
use App\Exports\AttendancesExport;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceController extends Controller
{
    public function show()
    {
        return view('attendance.view');
    }

    public function export(Request $request)
    {
        return Excel::download(
            new AttendancesExport($request->user()->id),
            'student_attendance.xlsx'
        );
    }
}
