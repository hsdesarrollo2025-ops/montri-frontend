const BASE = 'https://montri-backend.onrender.com/api/fiscal-profile';
const TAX_BASE = 'https://montri-backend.onrender.com/api';

export async function validateStatus(jwt) {
  try {
    const res = await fetch(`${BASE}/validate-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data?.error?.message || 'Error al validar perfil fiscal');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return await res.json();
  } catch (error) {
    console.error('Error en validateStatus:', error);
    throw error;
  }
}

export async function initProfile(jwt) {
  try {
    const res = await fetch(`${BASE}/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data?.error?.message || 'Error al iniciar perfil fiscal');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return await res.json();
  } catch (error) {
    console.error('Error en initProfile:', error);
    throw error;
  }
}

export async function updateSectionA(jwt, payload) {
  try {
    const res = await fetch(`${BASE}/section/A`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(
        data?.error?.message || data?.message || 'Error al guardar la Sección A'
      );
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en updateSectionA:', error);
    throw error;
  }
}

export async function getTaxCategories() {
  try {
    const res = await fetch(`${TAX_BASE}/tax-categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.message || 'Error al obtener categorías');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en getTaxCategories:', error);
    throw error;
  }
}

export async function updateSectionB(jwt, payload) {
  try {
    const res = await fetch(`${BASE}/section/B`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.message || 'Error al guardar la Sección B');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en updateSectionB:', error);
    throw error;
  }
}
