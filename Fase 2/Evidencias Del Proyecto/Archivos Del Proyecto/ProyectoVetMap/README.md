
# VetMap Starter

Esqueleto inicial del MVP de VetMap.

## Stack
- Backend: FastAPI + PostgreSQL
- Web: React + Vite + TailwindCSS
- Móvil: React Native + Expo Router

## 1. PostgreSQL
Crea una base de datos:

```sql
CREATE DATABASE vetmap_db;
```

## 2. Backend
```bash
cd backend
python -m venv .venv
```

En Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```

Instala dependencias:
```bash
pip install -r requirements.txt
```

Copia `.env.example` a `.env` y cambia `TU_PASSWORD`.

Ejecuta:
```bash
uvicorn app.main:app --reload
```

API:
- http://localhost:8000
- Documentación Swagger: http://localhost:8000/docs

## 3. Web
En otra terminal:
```bash
cd web
npm install
npm run dev
```

Abre:
- http://localhost:5173

## 4. Móvil
En otra terminal:
```bash
cd mobile
npm install
npx expo start
```

IMPORTANTE:
En `mobile/app/index.jsx`, reemplaza:

```js
const API_URL = "http://TU_IP_LOCAL:8000";
```

por la IP local de tu PC, por ejemplo:
```js
const API_URL = "http://192.168.1.50:8000";
```

El teléfono y el PC deben estar en la misma red Wi-Fi.

## Flujo de prueba
1. Registrar un usuario desde la web.
2. Iniciar sesión.
3. Registrar una mascota.
4. Cargar la lista de mascotas.
5. Usar el mismo usuario desde la app móvil para ver sus mascotas.
