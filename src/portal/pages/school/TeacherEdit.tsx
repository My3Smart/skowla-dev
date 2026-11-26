import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { api } from "@/portal/api";

interface SchoolClass {
  id: number;
  class_name: string;
  grade?: { grade_name: string };
}

interface TeacherForm {
  id: number;
  name: string;
  email: string;
  ic?: string;
  address?: string;
  phone_num?: string;
  status: string;
  classes: number[];
}

interface EditData {
  teacher: TeacherForm;
  classes: SchoolClass[];
}

export default function TeacherEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<TeacherForm | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [classSearch, setClassSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;
    api<EditData>(`/api/portal/teachers/${id}/edit`)
      .then((res) => {
        if (cancelled) return;

        console.log("Teacher API response:", res.teacher);
        console.log("Teacher status:", res.teacher.status);

        setTeacher(res.teacher);
        setClasses(res.classes ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setTeacher(null);
          setClasses([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function update<K extends keyof TeacherForm>(key: K, value: TeacherForm[K]) {
    setTeacher((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function toggleClass(classId: number) {
    setTeacher((prev) => {
      if (!prev) return prev;
      const has = prev.classes.includes(classId);
      return { ...prev, classes: has ? prev.classes.filter((c) => c !== classId) : [...prev.classes, classId] };
    });
  }

  const filteredClasses = classes.filter((c) => {
    const search = classSearch.toLowerCase();

    return (
      c.class_name.toLowerCase().includes(search) ||
      (c.grade?.grade_name ?? "").toLowerCase().includes(search)
    );
  });

  const selectedClasses = classes.filter((c) =>
    teacher?.classes.includes(c.id)
  );

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!teacher) return;

  setErrors({});

  try {
    console.log("Saving status:", teacher.status);

    await api(`/api/portal/teachers/${id}`, {
      method: "PUT",
      body: teacher,
    });

    await api(`/api/portal/teachers/${id}/classes`, {
      method: "PUT",
      body: {
        classes: teacher.classes,
      },
    });

    alert("Teacher updated successfully!");
    navigate("/school/teachers");
  } catch (error: any) {
    console.error("Teacher update failed:", error);

    if (error?.errors) {
      setErrors(error.errors);
    }

    alert(error?.message || "Failed to update teacher.");
  }
}

  if (loading) {
    return (
      <AppLayout title="Edit Teacher" role="school">
        <p className="text-muted">Loading…</p>
      </AppLayout>
    );
  }

  if (!teacher) {
    return (
      <AppLayout title="Edit Teacher" role="school">
        <div className="alert alert-warning">Unable to load teacher data.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Teacher" role="school">
      <div className="container mt-4">
        <div className="bg-white p-4 rounded">
          <h3 className="mb-3">Edit Teacher</h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={teacher.name}
                onChange={(e) => update("name", e.target.value)} />
              {errors.name && <small className="text-danger">{errors.name[0]}</small>}
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={teacher.email}
                onChange={(e) => update("email", e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">IC</label>
              <input type="text" className="form-control" value={teacher.ic ?? ""}
                onChange={(e) => update("ic", e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} value={teacher.address ?? ""}
                onChange={(e) => update("address", e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-control" value={teacher.phone_num ?? ""}
                onChange={(e) => update("phone_num", e.target.value)} />
            </div>


            <div className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <label className="form-label fw-bold fs-5 mb-0">
                  Assign Classes
                </label>

                <span className="badge badge-light-primary">
                  {teacher.classes.length} selected
                </span>
              </div>

              {/* Selected classes */}
              <div
                className="rounded p-4 mb-4"
                style={{
                  backgroundColor: "#f5f8fa",
                  border: "1px solid #e4e6ef",
                }}
              >
                <div className="fw-semibold text-gray-600 fs-7 mb-3">
                  SELECTED CLASSES
                </div>

                {selectedClasses.length === 0 ? (
                  <div className="text-muted fs-7">
                    No classes assigned yet.
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {selectedClasses.map((c) => (
                      <span
                        key={c.id}
                        className="badge badge-light-primary d-inline-flex align-items-center gap-2 py-2 px-3"
                      >
                        {c.grade?.grade_name
                          ? `${c.grade.grade_name} - `
                          : ""}
                        {c.class_name}

                        <button
                          type="button"
                          onClick={() => toggleClass(c.id)}
                          className="btn btn-sm p-0 border-0 text-primary"
                          aria-label={`Remove ${c.class_name}`}
                          title="Remove class"
                        >
                          <i className="ki-outline ki-cross fs-5 text-primary" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="position-relative mb-3">
                <i
                  className="ki-outline ki-magnifier fs-2 position-absolute top-50 translate-middle-y ms-4 text-gray-500"
                />

                <input
                  type="text"
                  className="form-control form-control-solid ps-12"
                  placeholder="Search by grade or class name..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                />
              </div>

              {/* Available classes */}
              <div
                className="rounded border"
                style={{
                  maxHeight: "250px",
                  overflowY: "auto",
                }}
              >
                {filteredClasses.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    No classes found.
                  </div>
                ) : (
                  filteredClasses.map((c) => {
                    const selected = teacher.classes.includes(c.id);

                    return (
                      <label
                        key={c.id}
                        className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom cursor-pointer"
                        style={{
                          backgroundColor: selected
                            ? "#f1faff"
                            : "#ffffff",
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selected}
                            onChange={() => toggleClass(c.id)}
                          />

                          <div>
                            <div className="fw-semibold text-gray-800">
                              {c.class_name}
                            </div>

                            <div className="text-muted fs-7">
                              {c.grade?.grade_name ?? "No grade"}
                            </div>
                          </div>
                        </div>

                        {selected && (
                          <span className="badge badge-light-success">
                            Assigned
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              <div className="text-muted fs-7 mt-2">
                Search and tick the classes you want to assign.
                Changes will be saved when you click Save.
              </div>
            </div>


            <div className="mb-3">
              <label className="form-label fw-semibold">Status</label>

              <select
                className="form-select"
                value={teacher.status ?? ""}
                onChange={(e) => {
                  console.log("Selected status:", e.target.value);
                  update("status", e.target.value);
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <small className="text-muted">
                Current selected status: {teacher.status}
              </small>

              {errors.status && (
                <div className="text-danger fs-7 mt-1">
                  {errors.status[0]}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-success">Save</button>
            <Link to="/school/teachers" className="btn btn-secondary ms-2">Cancel</Link>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
