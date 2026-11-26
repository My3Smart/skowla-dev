<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class SchoolStudentsExport extends DefaultValueBinder implements
    FromCollection,
    WithHeadings,
    WithColumnFormatting,
    WithCustomValueBinder,
    ShouldAutoSize
{
    public function __construct(private int $schoolId)
    {
    }

    public function collection()
    {
        return Student::where('school_id', $this->schoolId)
            ->orderBy('name')
            ->get()
            ->map(function ($student) {
                return [
                    $student->name,
                    (string) $student->ic,
                    $student->grade,
                    $student->class_name,
                    $student->status,
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Name',
            'IC',
            'Grade',
            'Class',
            'Status',
        ];
    }

    // Force IC values in column B to be stored as text
    public function bindValue(Cell $cell, $value)
    {
        if (
            $cell->getColumn() === 'B' &&
            $cell->getRow() > 1
        ) {
            $cell->setValueExplicit(
                (string) ($value ?? ''),
                DataType::TYPE_STRING
            );

            return true;
        }

        return parent::bindValue($cell, $value);
    }

    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT,
        ];
    }
}
