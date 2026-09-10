import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { api } from "@/portal/api";
import { AppLayout } from "../layouts/AppLayout";
import { Card } from "../components/Card";

type Period = "daily" | "weekly" | "monthly";

/** [present, absent, others] per period — shape returned by DashboardController */
type AttendanceData = Record<string, Record<Period, number[]> | null>;

const PERIODS: Period[] = ["daily", "weekly", "monthly"];

const LABELS: Record<Period, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
};

function DonutChart({ series }: { series: number[] }) {
  return (
    <Chart
      type="donut"
      height={250}
      series={series}
      options={{
        chart: { type: "donut" },
        colors: ["#50cd89", "#f1416c", "#f5d70f"],
        legend: { show: true, position: "bottom" },
        plotOptions: { pie: { customScale: 0.9 } },
        labels: ["Hadir", "Tidak Hadir", "Lain-lain"],
        responsive: [
          { breakpoint: 1024, options: { chart: { height: 220 } } },
          { breakpoint: 768, options: { chart: { height: 200 } } },
          { breakpoint: 480, options: { chart: { height: 180 } } },
        ],
      }}
    />
  );
}

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<Record<string, string>>({});
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<{ classes?: Record<string, string>; attendanceData?: AttendanceData }>(
      "/api/portal/teacher/dashboard"
    )
      .then((res) => {
        if (cancelled) return;
        setClasses(res.classes ?? {});
        setAttendanceData(res.attendanceData ?? {});
      })
      .catch(() => {
        if (!cancelled) {
          setClasses({});
          setAttendanceData({});
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const noClassAssigned = !loading && Object.keys(classes).length === 0;

  return (
    <AppLayout title="Dashboard" role="teacher">
      <Card>
        <div className="app-toolbar-wrapper d-flex align-items-center flex-stack flex-wrap gap-2 py-4 w-100">
          <div className="page-title d-flex flex-column justify-content-center gap-2 me-3">
            <h1 className="page-heading d-flex flex-column justify-content-center text-dark fw-bolder fs-1 m-0">
              Dashboard Guru
            </h1>
          </div>
        </div>

        {loading && <div className="text-muted text-center py-10">Memuatkan…</div>}

        {noClassAssigned && (
          <div className="alert alert-warning text-center">Tiada kelas ditetapkan kepada anda.</div>
        )}

        {Object.entries(classes).map(([className, gradeName]) => {
          const data = attendanceData[className];
          return (
            <div key={className}>
              <h4 className="fw-semibold text-dark mb-4">
                {gradeName} - {className}
              </h4>

              {data ? (
                <div className="row g-3 justify-content-center">
                  {PERIODS.map((period) => (
                    <div
                      key={period}
                      className="col-lg-4 col-md-6 col-12 text-center mb-4"
                    >
                      <h6 className="mb-2 text-muted text-uppercase">
                        {LABELS[period]}
                      </h6>
                      <div className="attendance-chart">
                        <DonutChart series={data[period] ?? [0, 0, 0]} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info text-center">
                  Kehadiran belum direkodkan untuk kelas ini.
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </AppLayout>
  );
}
