const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const STORAGE_KEYS = {
  ACCESS: "access",
  REFRESH: "refresh",
};

export function getAccessToken() {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(STORAGE_KEYS.ACCESS)
    : null;
}

export function getRefreshToken() {
  return typeof window !== "undefined"
    ? window.localStorage.getItem(STORAGE_KEYS.REFRESH)
    : null;
}

export function saveTokens({ access, refresh }) {
  if (typeof window === "undefined") return;
  if (access) {
    window.localStorage.setItem(STORAGE_KEYS.ACCESS, access);
  }
  if (refresh) {
    window.localStorage.setItem(STORAGE_KEYS.REFRESH, refresh);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.ACCESS);
  window.localStorage.removeItem(STORAGE_KEYS.REFRESH);
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  if (!data.access) {
    clearTokens();
    throw new Error("Token refresh response missing access token");
  }

  saveTokens({ access: data.access, refresh });
  return data.access;
}

export async function fetchWithAuth(input, init = {}) {
  const accessToken = getAccessToken();
  const originalHeaders = new Headers(init.headers || {});

  if (accessToken) {
    originalHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (!originalHeaders.has("Content-Type")) {
    originalHeaders.set("Content-Type", "application/json");
  }

  let response = await fetch(input, {
    ...init,
    headers: originalHeaders,
  });

  if (response.status === 401) {
    try {
      const refreshedAccess = await refreshAccessToken();
      originalHeaders.set("Authorization", `Bearer ${refreshedAccess}`);
      response = await fetch(input, {
        ...init,
        headers: originalHeaders,
      });
    } catch (error) {
      clearTokens();
      throw error;
    }
  }

  return response;
}

export async function signOut() {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearTokens();
    return;
  }

  try {
    await fetch(`${BASE_URL}/api/signout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    });
  } catch (error) {
    console.error("Sign out failed:", error);
  } finally {
    clearTokens();
  }
}

export function isAuthenticated() {
  return Boolean(getAccessToken() && getRefreshToken());
}
