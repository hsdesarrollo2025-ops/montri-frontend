const BASE = 'https://montri-backend.onrender.com/api';

export async function getDashboardSummary(jwt) {
  try {
    const res = await fetch(`${BASE}/dashboard/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.message || 'Error al obtener resumen del dashboard');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en getDashboardSummary:', error);
    throw error;
  }
}

export async function getDashboardAlerts(jwt) {
  try {
    const res = await fetch(`${BASE}/dashboard/alerts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || data?.message || 'Error al obtener alertas del dashboard');
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return data;
  } catch (error) {
    console.error('Error en getDashboardAlerts:', error);
    throw error;
  }
}

