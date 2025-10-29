export async function fetchEnums(apiBase, token) {
  const res = await fetch(`${apiBase}/api/enums`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Error cargando enums: ${res.status}`);
  return res.json();
}

