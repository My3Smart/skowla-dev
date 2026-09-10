import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { Card } from "@/portal/components/Card";
import { api, ApiError } from "@/portal/api";

interface SchoolRow {
  id: number;
  name: string;
  state?: string | null;
  district?: string | null;
  state_id?: number | null;
  district_id?: number | null;
}

export default function AdminSchools() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SchoolRow | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ schools?: SchoolRow[] }>("/api/portal/schools");
      setSchools(res.schools ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load schools.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await api(`/api/portal/schools/${editing.id}`, { method: "PUT", body: { name } });
        setMessage("School updated.");
      } else {
        await api("/api/portal/schools", { method: "POST", body: { name } });
        setMessage("School created.");
      }
      setEditing(null);
      setName("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  const remove = async (s: SchoolRow) => {
    if (!window.confirm(`Delete ${s.name}?`)) return;
    try {
      await api(`/api/portal/schools/${s.id}`, { method: "DELETE" });
      setMessage("School deleted.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <AppLayout title="Schools" role="admin">
      <Card>
        <div className="app-toolbar-wrapper d-flex align-items-center flex-stack py-4 w-100">
          <h1 className="page-heading text-dark fw-bolder fs-1 m-0">Schools</h1>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form className="d-flex gap-2 mb-5" onSubmit={submit}>
          <input
            className="form-control form-control-solid"
            placeholder="School name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">{editing ? "Update" : "Add School"}</button>
          {editing && (
            <button type="button" className="btn btn-light" onClick={() => { setEditing(null); setName(""); }}>
              Cancel
            </button>
          )}
        </form>

        {loading ? (
          <div className="text-muted">Loading…</div>
        ) : schools.length === 0 ? (
          <div className="alert alert-info text-center">No schools found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-row-bordered align-middle">
              <thead>
                <tr className="fw-bold text-muted">
                  <th>Name</th>
                  <th>State</th>
                  <th>District</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.state}</td>
                    <td>{s.district}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-light-primary me-2"
                        onClick={() => { setEditing(s); setName(s.name); }}
                      >
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-light-danger" onClick={() => remove(s)}>
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
