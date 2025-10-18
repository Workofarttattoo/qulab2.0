const BASE_URL = (() => {
  if (typeof window === "undefined") return "http://localhost:5050";
  const override = import.meta.env?.VITE_BOARDROOM_API_BASE;
  if (override) return override;
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:5050`;
})();

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || response.statusText || "Request failed");
  }
  return response.json();
}

export async function listCorporations() {
  const payload = await request("/api/corporations");
  return payload.data;
}

export async function createCorporation(body) {
  const payload = await request("/api/corporations", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function getCorporation(id) {
  const payload = await request(`/api/corporations/${id}`);
  return payload.data;
}

export async function getDashboard(id) {
  const payload = await request(`/api/corporations/${id}/dashboard`);
  return payload.data;
}

export async function updateOnboarding(id, body) {
  const payload = await request(`/api/corporations/${id}/onboarding`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function startResearch(id, body) {
  const payload = await request(`/api/corporations/${id}/research`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function getResearch(id) {
  const payload = await request(`/api/corporations/${id}/research`);
  return payload.data;
}

export function exportResearch(id) {
  return `${BASE_URL}/api/corporations/${id}/research/export`;
}

export async function lockBusiness(id, body) {
  const payload = await request(`/api/corporations/${id}/lock`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload.data;
}

export async function destroyLock(id) {
  await request(`/api/corporations/${id}/lock`, { method: "DELETE" });
}

export async function getCompliance(id) {
  const payload = await request(`/api/corporations/${id}/compliance`);
  return payload.data;
}

export async function createComplianceLog(id, body) {
  const payload = await request(`/api/corporations/${id}/compliance`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload.data;
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export async function uploadMemory(id, file) {
  const payload = await request(`/api/corporations/${id}/memories`, {
    method: "POST",
    body: JSON.stringify({
      filename: file.name,
      category: file.type || "artifact",
      content: await fileToBase64(file),
    }),
  });
  return payload.data;
}

export async function listMemories(id) {
  const payload = await request(`/api/corporations/${id}/memories`);
  return payload.data;
}
