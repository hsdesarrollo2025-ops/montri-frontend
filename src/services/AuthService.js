const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser(data) {
  try {
    const response = await fetch(`${API_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || 'Error al registrar usuario';
      const err = new Error(message);
      err.status = response.status;
      err.payload = errorData;
      throw err;
    }

    return await response.json();
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
}

export async function loginUser(data) {
  try {
    const payload = {
      identifier: data.email,
      password: data.password,
    };

    const response = await fetch(`${API_URL}/api/auth/local/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || 'Error al iniciar sesión';
      const err = new Error(message);
      err.status = response.status;
      err.payload = errorData;
      throw err;
    }

    return await response.json();
  } catch (error) {
    console.error('Error en loginUser:', error);
    // Normalizamos un posible error de red
    if (error instanceof TypeError && !('status' in error)) {
      const err = new Error('No se pudo conectar al servidor');
      err.code = 'NETWORK_ERROR';
      throw err;
    }
    throw error;
  }
}
