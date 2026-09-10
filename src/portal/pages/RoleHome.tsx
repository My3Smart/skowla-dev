import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";
import { homeForRole } from "../roles";
import TeacherDashboard from "./TeacherDashboard";

/**
 * /dashboard entry point: sends each signed-in user to the dashboard
 * that matches their Laravel role. Teachers stay here.
 */
export default function RoleHome() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="min-vh-100 d-flex flex-center text-muted">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role === "teacher") return <TeacherDashboard />;

  return <Navigate to={homeForRole(role)} replace />;
}
