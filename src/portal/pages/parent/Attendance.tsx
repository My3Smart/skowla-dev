import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { api, API_BASE, getToken } from "@/portal/api";

interface AttendanceRow {
  id: number;
  student?: { name?: string } | null;
  check_in?: string | null;
  check_out?: string | null;
  date?: string | null;
  status?: string | null;
  remarks?: string | null;
}

export default function Attendance() {
  const [attendances, setAttendances] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api<{ attendances?: AttendanceRow[] }>("/api/portal/parent/attendance")
      .then((res) => setAttendances(res.attendances ?? []))
      .catch(() => setAttendances([]))
      .finally(() => setLoading(false));
  }, []);

  
const handleExport = async () => {
  if (exporting) return;

  setExporting(true);

  try {
    const token = getToken();

    const response = await fetch(
      "/api/portal/parent/attendance/export",
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Export failed:", response.status, errorText);
      throw new Error(`Export failed: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (
      !contentType.includes("spreadsheetml") &&
      !contentType.includes("application/octet-stream")
    ) {
      const errorText = await response.text();
      console.error("Invalid Excel response:", errorText);
      throw new Error("Server did not return an Excel file.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "student_attendance.xlsx";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

  } catch (error) {
    console.error("Attendance export error:", error);
    alert("Unable to export attendance. Please try again.");
  } finally {
    setExporting(false);
  }
};


  return (
    <AppLayout title="Student's Attendance" role="parent">
      <div className="app-toolbar-wrapper d-flex align-items-center flex-stack flex-wrap gap-2 py-4 w-100">
        <div className="page-title d-flex flex-column justify-content-center gap-2 me-3">
          <h1 className="page-heading d-flex flex-column justify-content-center text-dark fw-bolder fs-1 m-0">
            Log
          </h1>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="btn btn-light-success me-3"
        >
          <i className="ki-duotone ki-exit-up fs-2">
            <span className="path1"></span>
            <span className="path2"></span>
          </i>
          {exporting ? "Exporting..." : "Export"}
        </button>
      </div>

      <div className="card">
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center text-muted py-10">Loading…</div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-row-bordered table-row-solid gy-4 gs-9">
                <thead className="border-gray-200 fs-5 fw-semibold bg-lighten">
                  <tr>
                    <th>No.</th>
                    <th>Student's Name</th>
                    <th>Check-In</th>
                    <th>Check Out</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="fs-6 fw-semibold text-gray-600">
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center">
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    attendances.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>{row.student?.name ?? "N/A"}</td>
                        <td>{row.check_in ?? "-"}</td>
                        <td>{row.check_out ?? "-"}</td>
                        <td>{row.date ?? "-"}</td>
                        <td>{row.status ?? "-"}</td>
                        <td>{row.remarks ?? "-"}</td>
                        <td>
                          {row.status?.toLowerCase() === "absent" && (
                            <Link
                              to={`/parent/remarks/edit?id=${row.id}`}
                              className="btn btn-sm btn-primary"
                            >
                              Edit
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
