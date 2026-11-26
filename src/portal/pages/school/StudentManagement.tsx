import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { Card } from "@/portal/components/Card";
import { api, apiDownload } from "@/portal/api";
import { useAuth } from "@/portal/auth";

interface Student {
  id: number;
  name: string;
  ic?: string;
  grade?: string;
  class_name?: string;
  status?: string;
}

interface School {
  id: number;
  name: string;
}

interface ManagementData {
  school: School;
  students: Student[];
}

export default function StudentManagement() {
  const { user, loading: authLoading } = useAuth();
  const schoolId = user?.school_id;

  const [school, setSchool] = useState<School | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    console.log("AUTH USER:", user);
    console.log("SCHOOL ID:", schoolId);

    if (!schoolId) {
      console.error("Authenticated school user has no school_id:", user);
      setLoading(false);
      return;
    }

    let cancelled = false;

    api<ManagementData>(
      `/api/portal/schools/${schoolId}/students/management`
    )
      .then((res) => {
        if (cancelled) return;

        setSchool(res.school ?? null);
        setStudents(res.students ?? []);
      })
      .catch((error) => {
        console.error("Failed to load students:", error);

        if (!cancelled) {
          setSchool(null);
          setStudents([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, schoolId, user]);


  async function handleExport() {
    if (exporting) return;

    setExporting(true);

    try {
      await apiDownload(
        "/api/portal/school/students/export",
        "school_students.xlsx"
      );

      console.log("Students exported successfully.");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Unable to export students. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDownloadTemplate() {
    console.log("Downloading student template...");

    try {
      await apiDownload(
        "/api/portal/students/template/download",
        "student_import_template.xlsx"
      );

      console.log("Template downloaded successfully.");
    } catch (error) {
      console.error("TEMPLATE DOWNLOAD ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to download student template."
      );
    }
  }


async function handleImportStudents(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  if (importing) return;

  if (!schoolId) {
    setImportError("School ID is missing.");
    return;
  }

  const formData = new FormData(e.currentTarget);
  const file = formData.get("import_file");

  if (!(file instanceof File) || file.size === 0) {
    setImportError("Please select an Excel file.");
    return;
  }

  formData.set("school_id", String(schoolId));

  setImporting(true);
  setImportError(null);
  setSuccessMsg(null);

  try {
    console.log("Importing students...");

    const result = await api(
      "/api/portal/students/import",
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("Import response:", result);

    // Refresh the student list.
    const updated = await api<ManagementData>(
      `/api/portal/schools/${schoolId}/students/management`
    );

    setSchool(updated.school ?? null);
    setStudents(updated.students ?? []);

    setSuccessMsg("Students imported successfully.");
    setShowImport(false);
  } catch (error) {
    console.error("STUDENT IMPORT ERROR:", error);

    setImportError(
      error instanceof Error
        ? error.message
        : "Unable to import students."
    );
  } finally {
    setImporting(false);
  }
}



  return (
    <AppLayout title="Student Management" role="school">
      <Card>
        <div className="app-toolbar-wrapper d-flex align-items-center flex-stack flex-wrap gap-2 py-4 w-100">
          <div className="page-title d-flex flex-column justify-content-center gap-2 me-3">
            <h3 className="text-2xl font-semibold mb-3">
              List of Students {school ? `- ${school.name}` : ""}
            </h3>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="dropdown">
              <button
                className="btn btn-light-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="ki-duotone ki-plus fs-2"></i> Add Student
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/school/students/create">Add Manually</Link>
                </li>
                <li>
                  <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setShowImport(true); }}>
                    Import Excel
                  </a>
                </li>
              </ul>
            </div>

            <button
              type="button"
              className="btn btn-light-success"
              onClick={handleExport}
              disabled={exporting || loading || !schoolId}
            >
              <i className="ki-duotone ki-exit-up fs-2"></i>
              {exporting ? "Exporting..." : "Export"}
            </button>
          </div>

          {successMsg && (
            <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
              {successMsg}
              <button type="button" className="btn-close" onClick={() => setSuccessMsg(null)}></button>
            </div>
          )}
        </div>

        <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-4">
          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : students.length === 0 ? (
            <div className="alert alert-info">No students found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-row-bordered gy-4">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>IC</th>
                    <th>Grade</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id}>
                      <td>{idx + 1}</td>
                      <td>{s.name}</td>
                      <td>{s.ic ?? "-"}</td>
                      <td>{s.grade ?? "-"}</td>
                      <td>{s.class_name ?? "-"}</td>
                      <td>{s.status ?? "-"}</td>
                      <td className="text-center">
                        <Link to={`/school/students/${s.id}`} className="btn btn-sm btn-primary me-1">View</Link>
                        <Link to={`/school/students/${s.id}/edit`} className="btn btn-sm btn-warning">Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        
<div
  className={`modal fade ${showImport ? "show d-block" : ""}`}
  tabIndex={-1}
  aria-hidden={!showImport}
>
  <div className="modal-dialog">
    <form
      className="modal-content"
      onSubmit={handleImportStudents}
      encType="multipart/form-data"
    >
      <div className="modal-header">
        <h5 className="modal-title">
          Import Students From Excel
        </h5>

        <button
          type="button"
          className="btn-close"
          disabled={importing}
          onClick={() => {
            setImportError(null);
            setShowImport(false);
          }}
        />
      </div>

      <div className="modal-body">
        <p className="mb-3">
          Please use the provided template.
        </p>

        <button
          type="button"
          className="btn btn-link p-0 mb-4"
          onClick={handleDownloadTemplate}
        >
          Download Template
        </button>

        <div className="mb-3">
          <label
            htmlFor="import_file"
            className="form-label"
          >
            Upload Excel File
          </label>

          <input
            type="file"
            className="form-control"
            id="import_file"
            name="import_file"
            accept=".xlsx,.xls"
            disabled={importing}
            required
          />
        </div>

        {importError && (
          <div
            className="alert alert-danger mt-3"
            role="alert"
          >
            {importError}
          </div>
        )}
      </div>

      <input
        type="hidden"
        name="school_id"
        value={schoolId ?? ""}
      />

      <div className="modal-footer">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={importing || !schoolId}
        >
          {importing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Importing...
            </>
          ) : (
            "Import"
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          disabled={importing}
          onClick={() => {
            setImportError(null);
            setShowImport(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</div>

      </Card>
    </AppLayout>
  );
}
