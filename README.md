# Montri Frontend

## 🚀 Deploy en Vercel

1. Subir este repositorio a GitHub.
2. En Vercel: "Add New Project" → seleccionar este repo.
3. Framework: Vite.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Variable de entorno: `VITE_API_BASE_URL=https://montri-backend.onrender.com`
7. Deploy.

Nota: En entorno local también se usa el backend de Render, por lo que no se requiere levantar Strapi en local.

## Entorno

- Configurar `VITE_API_BASE_URL` para apuntar al backend.
- Archivos disponibles:
  - `.env.example` (referencia)
  - `.env.local` (desarrollo local)

