<?php

namespace App\Exports;

use App\Models\Attendance;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AttendancesExport implements FromCollection, WithHeadings
{
    protected int $parentId;

    public function __construct(int $parentId)
    {
        $this->parentId = $parentId;
    }

    public function collection()
    {
        // Find children linked to this parent through guardians
        $studentIds = DB::table('guardians')
            ->whereIn('ic', function ($query) {
                $query->select('ic')
                    ->from('users')
                    ->where('id', $this->parentId);
            })
            ->pluck('student_id');

        // Retrieve only the parent's children's attendance
        $attendances = Attendance::with('student')
            ->whereIn('student_id', $studentIds)
            ->orderBy('date', 'desc')
            ->get();

        return $attendances->map(function ($attendance) {
            return [
                $attendance->student?->name ?? 'N/A',
                $attendance->check_in,
                $attendance->check_out,
                $attendance->date,
                $attendance->status,
                $attendance->remarks ?? 'N/A',
                $attendance->remarks_desc ?? 'N/A',
                $attendance->created_at,
                $attendance->updated_at,
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Check In',
            'Check Out',
            'Date',
            'Status',
            'Remarks',
            'Remarks Description',
            'Created At',
            'Updated At',
        ];
    }
}
