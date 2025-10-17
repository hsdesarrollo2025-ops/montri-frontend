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
