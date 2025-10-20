const BASE = 'https://montri-backend.onrender.com/api/fiscal-profile';

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

