import api from '../api/axiosConfig';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (process.env.VITE_API_URL || 'http://localhost:1337');
const BASE = `${API_BASE}/api/fiscal-profile`;
const TAX_BASE = `${API_BASE}/api`;

// Generic update of a fiscal profile section using JWT-bound user context
export async function updateSection(section, data, _jwt, opts = {}) {
  try {
    const draft = Boolean(opts && opts.draft);
    const url = `${BASE}/section/${section}${draft ? '?draft=true' : ''}`;
    const res = await api.put(url, draft ? { ...(data || {}), draft: true } : (data || {}));
    return res.data;
  } catch (error) {
    console.error('Error en updateSection:', error);
    throw error;
  }
}

export async function validateStatus() {
  try {
    const res = await api.get(`${BASE}/validate-status`);
    return res.data;
  } catch (error) {
    console.error('Error en validateStatus:', error);
    throw error;
  }
}

export async function initProfile() {
  try {
    const res = await api.post(`${BASE}/init`, {});
    return res.data;
  } catch (error) {
    console.error('Error en initProfile:', error);
    throw error;
  }
}

export async function updateSectionA(jwt, data) {
  try {
    const payload = {
      ...data,
      cuit: String(data.cuit || '').replace(/[^0-9]/g, ''),
      addressNumber: Number(data.addressNumber),
      postalCode: Number(data.postalCode),
    };

    const response = await api.put(`${BASE}/section/A`, payload);
    return response.data;
  } catch (err) {
    console.error('Error en updateSectionA:', err);
    throw err;
  }
}

export async function getTaxCategories() {
  try {
    const res = await api.get(`${TAX_BASE}/tax-categories`);
    return res.data;
  } catch (error) {
    console.error('Error en getTaxCategories:', error);
    throw error;
  }
}

export async function updateSectionB(jwt, payload) {
  try {
    const res = await api.put(`${BASE}/section/B`, payload);
    return res.data;
  } catch (error) {
    console.error('Error en updateSectionB:', error);
    throw error;
  }
}

// Get fiscal profile for the currently authenticated user (by JWT)
export async function getProfileByUser(jwt, fallbackUserId) {
  try {
    const res = await api.get(`${BASE}/me`);
    if (res.status === 404) {
      if (fallbackUserId) {
        try {
          const resLegacy = await api.get(`${BASE}/${fallbackUserId}`);
          if (resLegacy.status === 200) {
            return resLegacy.data;
          }
        } catch (e) {
          console.error('Fallback a /:userId falló:', e);
        }
      }
      try { await api.post(`${BASE}/init`, {}); } catch (e) { console.error('Error al inicializar perfil fiscal tras 404:', e); }
      return null;
    }
    return res.data;
  } catch (error) {
    console.error('Error en getProfileByUser:', error);
    return null;
  }
}

// Deprecated: direct by userId. Prefer getProfileByUser(jwt).
export async function getFiscalProfile(jwt, userId) {
  if (!userId) return null;
  try {
    const res = await api.get(`${BASE}/${userId}`);
    return res.data;
  } catch (error) {
    console.error('Error en getFiscalProfile:', error);
    return null;
  }
}
