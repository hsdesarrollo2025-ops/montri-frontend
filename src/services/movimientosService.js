import { API_BASE_URL } from '../config/api';
const DEFAULT_BASE = API_BASE_URL;

const buildHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// Nota: usamos un único campo relacional configurable (por defecto 'user')

export async function getIngresos(userId, token, apiBase = DEFAULT_BASE) {
  if (userId === undefined || userId === null) return [];
  const url = `${apiBase}/api/ingresos`;
  const res = await fetch(url, { headers: buildHeaders(token) });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `GET ingresos fallo: ${res.status}`);
  }
  const j = await res.json().catch(() => ({}));
  const d = j?.data ?? j ?? [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.results)) return d.results;
  return [];
}

export async function getEgresos(userId, token, apiBase = DEFAULT_BASE) {
  if (userId === undefined || userId === null) return [];
  const url = `${apiBase}/api/egresos`;
  const res = await fetch(url, { headers: buildHeaders(token) });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `GET egresos fallo: ${res.status}`);
  }
  const j = await res.json().catch(() => ({}));
  const d = j?.data ?? j ?? [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.results)) return d.results;
  return [];
}

export async function createIngreso(data, token, apiBase = DEFAULT_BASE) {
  const res = await fetch(`${apiBase}/api/ingresos`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `POST ingresos fallo: ${res.status}`);
  }
  return res.json().catch(() => ({}));
}

export async function createEgreso(data, token, apiBase = DEFAULT_BASE) {
  const res = await fetch(`${apiBase}/api/egresos`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `POST egresos fallo: ${res.status}`);
  }
  return res.json().catch(() => ({}));
}
