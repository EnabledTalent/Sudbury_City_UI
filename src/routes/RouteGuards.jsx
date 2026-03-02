import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken } from "../services/authService";

const normalizeRole = (role) => String(role || "").trim().toUpperCase();

const getRoleFromToken = () => {
  const token = getToken();
  if (!token) return "";

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return normalizeRole(payload.role);
  } catch {
    return "";
  }
};

const getCurrentRole = () => {
  const storageRole = normalizeRole(localStorage.getItem("role"));
  return storageRole || getRoleFromToken();
};

const hasValidToken = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload?.exp) return true;
    return Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
};

export function PublicOnlyRoute() {
  if (!hasValidToken()) return <Outlet />;

  const role = getCurrentRole();
  const destination = role === "EMPLOYER" ? "/employer/dashboard" : "/student/view-profile";
  return <Navigate to={destination} replace />;
}

export function RequireAuth() {
  const location = useLocation();

  if (!hasValidToken()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function RequireRole({ allowedRoles = [] }) {
  const role = getCurrentRole();
  const normalizedAllowed = allowedRoles.map(normalizeRole);

  if (!normalizedAllowed.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
