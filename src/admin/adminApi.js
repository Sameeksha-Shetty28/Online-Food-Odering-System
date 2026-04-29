export const API_BASE_URL = "http://127.0.0.1:8000/api";
export const ADMIN_TOKEN_KEY = "adminToken";

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem("adminAuth");
}

export async function adminFetch(path, options = {}, navigate) {
  const token = getAdminToken();

  if (!token) {
    clearAdminAuth();
    navigate("/admin/login", { replace: true });
    throw new Error("Admin token missing");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    clearAdminAuth();
    navigate("/admin/login", { replace: true });
    throw new Error("Admin token expired");
  }

  return response;
}
