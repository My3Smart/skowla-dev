import type { Role } from "./auth";

/** Where each role lands after a successful login. */
export const ROLE_HOME: Record<Role, string> = {
  parent: "/parent/dashboard",
  teacher: "/dashboard",
  school: "/school/dashboard",
  ppd: "/ppd/dashboard",
  state: "/state/dashboard",
  country: "/country/dashboard",
  admin: "/admin",
};

export function homeForRole(role: Role | undefined | null): string {
  return (role && ROLE_HOME[role]) || "/dashboard";
}
