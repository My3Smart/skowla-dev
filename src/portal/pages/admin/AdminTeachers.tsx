import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { Card } from "@/portal/components/Card";
import { api, ApiError } from "@/portal/api";

interface TeacherRow {
  id: number;
  name: string;
  email: string;
  phone_num?: string;
  school_id?: number | null;
}

interface SchoolRow {
  id: number;
  name: string;
}

const EMPTY = { name: "", email: "", phone_num: "", password: "", school_id: "" };

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        api<{ teachers?: TeacherRow[] }>("/api/portal/teachers"),
        api<{ schools?: SchoolRow[] }>("/api/portal/schools"),
      ]);
      setTeachers(t.teachers ?? []);
      setSchools(s.schools ?? []);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    const body = {
      name: form.name,
      email: form.email,
      phone_num: form.phone_num || null,
      school_id: form.school_id ? Number(form.school_id) : null,
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (editingId) {
        await api(`/api/portal/teachers/${editingId}`, { method: "PUT", body });
        setMessage("Teacher updated.");
      } else {
        await api("/api/portal/teachers", { method: "POST", body });
        setMessage("Teacher created.");
      }
      setForm({ ...EMPTY });
      setEditingId(null);
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.errors) setErrors(err.errors);
      else setMessage("Save failed.");
    }
  };

  const remove = async (t: TeacherRow) => {
    if (!window.confirm(`Delete ${t.name}?`)) return;
    await api(`/api/portal/teachers/${t.id}`, { method: "DELETE" }).catch(() => null);
    setMessage("Teacher deleted.");
    await load();
  };

  const field = (key: keyof typeof EMPTY) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <AppLayout title="Teachers" role="admin">
      <Card>
        <div className="app-toolbar-wrapper d-flex align-items-center flex-stack py-4 w-100">
          <h1 className="page-heading text-dark fw-bolder fs-1 m-0">Teachers</h1>
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        <form className="row g-3 mb-6" onSubmit={submit}>
          <div className="col-md-3">
            <input className="form-control form-control-solid" placeholder="Full name" required {...field("name")} />
            {errors.name && <div className="text-danger fs-7">{errors.name[0]}</div>}
          </div>
          <div className="col-md-3">
            <input className="form-control form-control-solid" placeholder="Email" type="email" required {...field("email")} />
            {errors.email && <div className="text-danger fs-7">{errors.email[0]}</div>}
          </div>
          <div className="col-md-2">
            <input className="form-control form-control-solid" placeholder="Phone" {...field("phone_num")} />
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-solid" {...field("school_id")}>
              <option value="">School…</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input
              className="form-control form-control-solid"
              placeholder={editingId ? "New password (optional)" : "Password"}
              type="password"
              required={!editingId}
              {...field("password")}
            />
            {errors.password && <div className="text-danger fs-7">{errors.password[0]}</div>}
          </div>
          <div className="col-12 d-flex gap-2">
            <button type="submit" className="btn btn-primary">{editingId ? "Update Teacher" : "Add Teacher"}</button>
            {editingId && (
              <button type="button" className="btn btn-light" onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : teachers.length === 0 ? (
          <div className="alert alert-info text-center">No teachers found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-row-bordered align-middle">
              <thead>
                <tr className="fw-bold text-muted">
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{t.phone_num}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-light-primary me-2"
                        onClick={() => {
                          setEditingId(t.id);
                          setForm({
                            name: t.name,
                            email: t.email,
                            phone_num: t.phone_num ?? "",
                            password: "",
                            school_id: t.school_id ? String(t.school_id) : "",
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-light-danger" onClick={() => remove(t)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
