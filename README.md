# Grabador web 🎥

Un grabador de pantalla online estilo Loom / Screen Studio pero 100% web y open-source.

## 🚀 Características

- **Grabación Nativa:** Captura pantalla, ventanas, pestañas o webcam sin instalar nada.
- **Audio Dual:** Soporta audio del sistema y micrófono simultáneamente.
- **Calidad Configurable:** Elige entre 720p, 1080p o 4K.
- **Modo Invitado:** Graba hasta 10 minutos y descarga localmente sin registrarte.
- **Modo Pro:** Grabaciones ilimitadas y almacenamiento en la nube por 30 días.
- **Dashboard Personal:** Gestiona, descarga y elimina tus grabaciones guardadas.

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Animaciones:** Framer Motion
- **Iconos:** Lucide React
- **Backend:** Express (Node.js)
- **Base de Datos & Auth:** Supabase
- **Almacenamiento:** Supabase Storage

## ⚙️ Configuración de Supabase

Para que la persistencia en la nube funcione, necesitas configurar un proyecto en Supabase:

1. Crea un nuevo proyecto en [Supabase](https://supabase.com).
2. Crea una tabla llamada `recordings` con el siguiente esquema:
   ```sql
   create table recordings (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users not null,
     filename text not null,
     duration integer not null,
     url text not null,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null,
     expires_at timestamp with time zone not null
   );
   ```
3. Crea un bucket en **Storage** llamado `recordings` y hazlo público (o configura políticas RLS adecuadas).
4. Configura las variables de entorno en tu archivo `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 📦 Instalación

```bash
npm install
npm run dev
```

## 📄 Licencia

Este proyecto es open-source bajo la licencia MIT.
