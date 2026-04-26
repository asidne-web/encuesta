# RentaFácil — Cuestionario IRPF 2025

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fasidne-web%2Fencuesta)

Aplicación web de cuestionario previo para la Declaración de la Renta de personas físicas en España.

## 🚀 Inicio rápido (Modo Local)

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`

## 📡 Conectar con Supabase

### 1. Crear proyecto en Supabase
Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.

### 2. Ejecutar la migración
En el SQL Editor de Supabase, ejecuta el script:
```
sql/001_create_survey_submissions.sql
```

### 3. Configurar variables de entorno
Copia `.env.example` a `.env.local` y rellena:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...tu_anon_key
```

### 4. Reiniciar el servidor
```bash
npm run dev
```
El badge del footer cambiará de "🟡 Modo local" a "🟢 Conectado".

## 📁 Estructura del proyecto

```
src/
├── components/         # Componentes reutilizables
│   ├── Button.tsx      # Botones con variantes
│   ├── Card.tsx        # Tarjetas con header
│   ├── Footer.tsx      # Footer con badge de conexión
│   ├── FormControls.tsx # Inputs, radios, checkboxes, selects
│   ├── Header.tsx      # Header con glassmorphism
│   ├── ProgressBar.tsx # Barra de progreso animada
│   ├── RestoreDialog.tsx # Diálogo de restaurar sesión
│   └── Toast.tsx       # Notificaciones toast
├── data/
│   └── surveyData.ts   # Definición de las 6 secciones de preguntas
├── hooks/
│   └── useSurvey.ts    # Hook principal (estado, validación, persistencia)
├── lib/
│   ├── supabase.ts     # Cliente Supabase (auto-detecta modo)
│   └── submitSurvey.ts # Servicio de envío (Supabase o local)
├── pages/
│   ├── WelcomeScreen.tsx  # Pantalla de bienvenida
│   ├── SurveyPage.tsx     # Wizard con las 6 secciones
│   └── SummaryScreen.tsx  # Resumen y confirmación final
├── types/
│   └── survey.ts       # Tipos TypeScript
├── App.tsx             # Orquestador principal
└── index.css           # Sistema de diseño (tokens CSS)
```

## 🎯 Funcionalidades

- ✅ Flujo wizard de 6 secciones con animaciones (Framer Motion)
- ✅ Validaciones por sección (campos obligatorios, formato IBAN)
- ✅ Campos condicionales dinámicos (aparecen según respuesta)
- ✅ Auto-guardado con localStorage
- ✅ Restauración de sesión guardada
- ✅ Pantalla de resumen con secciones colapsables
- ✅ Notificaciones toast
- ✅ Diseño responsive (PC + móvil)
- ✅ Integración dual: Supabase (producción) o modo local
- ✅ Footer con indicador de estado de conexión
- ✅ SEO optimizado (meta tags, lang)

## 🗄️ Base de Datos

La tabla `survey_submissions` almacena:
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `client_name` | TEXT | Nombre del contribuyente |
| `client_nif` | TEXT | NIF/NIE |
| `answers` | JSONB | Todas las respuestas |
| `status` | TEXT | pending → reviewed → completed |
| `submitted_at` | TIMESTAMPTZ | Fecha de envío |

## 📋 Secciones de la Encuesta

1. **Situación personal y familiar** — Estado civil, hijos, ascendientes, discapacidad
2. **Rendimientos del trabajo** — Empleadores, SEPE, indemnizaciones, maternidad
3. **Rendimientos del capital** — Inmuebles, alquileres, intereses bancarios
4. **Actividades económicas** — Autónomos, facturación, cuotas RETA
5. **Ganancias y pérdidas patrimoniales** — Ventas, inversiones, subvenciones
6. **Deducciones y datos bancarios** — Alquiler, hipoteca, donativos, IBAN
