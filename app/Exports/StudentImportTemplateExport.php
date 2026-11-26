<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DefaultValueBinder;
use PhpOffice\PhpSpreadsheet\Cell\Cell;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class StudentImportTemplateExport extends DefaultValueBinder implements
    FromArray,
    WithHeadings,
    ShouldAutoSize,
    WithColumnFormatting,
    WithCustomValueBinder,
    WithEvents
{
    public function array(): array
    {
        return [];
    }

    public function headings(): array
    {
        return [
            'Nama Penuh',
            'No. Kad Pengenalan',
            'No. Sijil Lahir',
            'Tarikh Lahir',
            'Darjah/Tingkatan',
            'Kelas',
            'Jantina',
            'Kaum',
            'Agama',
            'Kewarganegaraan',
            'Yatim',
            'OKU',
            'Alamat',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'B' => NumberFormat::FORMAT_TEXT,
            'C' => NumberFormat::FORMAT_TEXT,
            'D' => 'yyyy-mm-dd',
        ];
    }

    public function bindValue(Cell $cell, $value)
    {
        if (
            in_array($cell->getColumn(), ['B', 'C'], true)
            && $cell->getRow() > 1
        ) {
            $cell->setValueExplicit(
                $value === null ? '' : (string) $value,
                DataType::TYPE_STRING
            );

            return true;
        }

        return parent::bindValue($cell, $value);
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Preformat IC and birth certificate cells as text.
                $sheet->getStyle('B2:C1000')
                    ->getNumberFormat()
                    ->setFormatCode(NumberFormat::FORMAT_TEXT);

                // Widen columns to show complete numbers.
                $sheet->getColumnDimension('B')->setWidth(22);
                $sheet->getColumnDimension('C')->setWidth(22);
            },
        ];
    }
}
