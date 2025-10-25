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

export async function updateSectionA(jwt, data) {
  try {
    const payload = {
      ...data,
      cuit: String(data.cuit || '').replace(/[^0-9]/g, ''),
      addressNumber: Number(data.addressNumber),
      postalCode: Number(data.postalCode),
    };

    const response = await fetch(
      `${BASE}/section/A`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const dataRes = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(dataRes?.error?.message || dataRes?.message || 'Error al guardar los datos');
      err.status = response.status;
      err.payload = dataRes;
      throw err;
    }

    return dataRes;
  } catch (err) {
    console.error('Error en updateSectionA:', err);
    throw err;
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

export async function getFiscalProfile(jwt, userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${BASE}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.message || 'Error al obtener perfil fiscal');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en getFiscalProfile:', error);
    return null;
  }
}

export async function updateSectionC(jwt, payload) {
  try {
    const res = await fetch(`${BASE}/section/C`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.message || 'Error al guardar la Sección C');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en updateSectionC:', error);
    throw error;
  }
}

// Nuevo: obtener el perfil fiscal del usuario autenticado (por JWT)
export async function getProfileByUser(jwt, fallbackUserId) {
  try {
    const res = await fetch(`${BASE}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (res.status === 404) {
      // Fallback a endpoint legado por userId
      if (fallbackUserId) {
        try {
          const resLegacy = await fetch(`${BASE}/${fallbackUserId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${jwt}`,
            },
          });
          if (resLegacy.ok) {
            return await resLegacy.json().catch(() => ({}));
          }
        } catch (e) {
          console.error('Fallback a /:userId falló:', e);
        }
      }
      // Si no existe, inicializar un perfil vacío
      try {
        await fetch(`${BASE}/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({}),
        });
      } catch (e) {
        console.error('Error al inicializar perfil fiscal tras 404:', e);
      }
      return null;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.message || 'Error al obtener perfil fiscal');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en getProfileByUser:', error);
    return null;
  }
}
