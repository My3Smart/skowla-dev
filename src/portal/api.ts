/**
 * Thin client for the EXISTING Laravel backend.
 * The backend is untouched: we call the same routes the Blade app uses,
 * with session cookies (Sanctum/Fortify) and CSRF handling.
 */

export const API_BASE =
  (import.meta.env.VITE_LARAVEL_URL as string | undefined)?.replace(/\/$/, "") ||
  "";

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/* ---- Sanctum personal access token (works cross-origin, no cookies) ---- */

const TOKEN_KEY = "portal_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export async function csrf(): Promise<void> {
  try {
    await fetch(`${API_BASE}/sanctum/csrf-cookie`, { credentials: "include" });
  } catch {
    /* backend may be offline in preview */
  }
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** send as form-encoded (Laravel web routes) instead of JSON */
  form?: boolean;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {}, form = false } = options;

  if (method !== "GET" && !getCookie("XSRF-TOKEN")) {
    await csrf();
  }

  const csrfToken = getCookie("XSRF-TOKEN");
  const bearer = getToken();
  const init: RequestInit = {
    method,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      ...headers,
    },
  };

  if (body !== undefined) {
    if (form) {
      const fd = new URLSearchParams();
      Object.entries(body as Record<string, unknown>).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      (init.headers as Record<string, string>)["Content-Type"] =
        "application/x-www-form-urlencoded";
      init.body = fd.toString();
    } else if (body instanceof FormData) {
      init.body = body;
    } else {
      (init.headers as Record<string, string>)["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, init);
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    if (res.status === 401) setToken(null);
    const payload = (data ?? {}) as { message?: string; errors?: Record<string, string[]> };
    throw new ApiError(payload.message || res.statusText, res.status, payload.errors);
  }

  return data as T;
}


  export async function apiDownload(
    path: string,
    filename: string
  ): Promise<void> {
    const csrfToken = getCookie("XSRF-TOKEN");
    const bearer = getToken();

    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "X-Requested-With": "XMLHttpRequest",
        ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    });

    if (!response.ok) {
      const message = await response.text();
      console.error("Download error:", response.status, message);

      throw new Error(`Download failed: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (
      !contentType.includes(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) &&
      !contentType.includes("application/octet-stream")
    ) {
      const text = await response.text();
      console.error("Unexpected download response:", text.slice(0, 1000));
      throw new Error("Server did not return an Excel file.");
    }

    const blob = await response.blob();

    const signature = new Uint8Array(
      await blob.slice(0, 4).arrayBuffer()
    );

    if (signature[0] !== 0x50 || signature[1] !== 0x4b) {
      throw new Error("Downloaded file is not a valid XLSX container.");
    }

    const url = window.URL.createObjectURL(blob);

    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    }
  }
