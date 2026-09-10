import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/portal/layouts/AppLayout";
import { Card } from "@/portal/components/Card";
import { api } from "@/portal/api";

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone_num?: string;
  roles?: string[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term = "") => {
    setLoading(true);
    try {
      const res = await api<{ users?: UserRow[] }>(
        `/api/portal/users${term ? `?search=${encodeURIComponent(term)}` : ""}`
      );
      setUsers(res.users ?? []);
      setError(null);
    } catch (e) {
      setUsers([]);
      setError(e instanceof Error ? e.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (u: UserRow) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api(`/api/portal/users/${u.id}`, { method: "DELETE" });
      setSuccess("User deleted.");
      await load(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    }
  };

  return (
    <AppLayout title="User List" role="admin">
      <Card>
        <div className="app-toolbar-wrapper d-flex align-items-center flex-stack flex-wrap gap-2 py-4 w-100 justify-content-end">
          <div className="page-title d-flex flex-column justify-content-center gap-2 me-3">
            <h1 className="page-heading d-flex flex-column justify-content-center text-dark fw-bolder fs-1 m-0">User List</h1>
          </div>
          <div className="d-flex gap-2">
            <input
              className="form-control form-control-solid w-250px"
              placeholder="Search name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(search)}
            />
            <Link to="/admin/users/add" className="btn btn-primary">
              <i className="ki-duotone ki-plus fs-2" />Create User
            </Link>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="py-12">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg p-4">
              {loading ? (
                <div className="text-muted">Loading…</div>
              ) : users.length === 0 ? (
                <div className="alert alert-info text-center">No users found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-row-bordered align-middle">
                    <thead>
                      <tr className="fw-bold text-muted">
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Roles</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.phone_num}</td>
                          <td>{(u.roles ?? []).join(", ")}</td>
                          <td className="text-end">
                            <Link to={`/admin/users/${u.id}/edit`} className="btn btn-sm btn-light-primary me-2">Edit</Link>
                            <button type="button" className="btn btn-sm btn-light-danger" onClick={() => remove(u)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}
