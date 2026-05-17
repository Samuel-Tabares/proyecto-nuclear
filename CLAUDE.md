# CLAUDE.md — proyecto_nuclear_V (SGIL)

Este archivo es la **fuente de instrucciones operativas** para Claude Code en este repositorio. Léelo completo antes de cualquier tarea. Si una instrucción aquí choca con tu intuición general, prevalece este archivo.

---

## 1. Contexto del proyecto

**Sistema de Gestión de Inventario y Logística (SGIL)** para un centro de distribución de pastelería. Proyecto académico de la Corporación Universitaria Alexander von Humboldt, semestre I-2026.

El proyecto se entrega en **tres cortes académicos** (21 abril → 26 junio 2026):

- **Corte 1**: gestión de usuarios (RF-00), autenticación y control de acceso (RF-01, RF-02, RF-03), wireframes y prototipos de UI.
- **Corte 2**: productos (RF-04 a RF-07), lotes (RF-08, RF-09), recepción (RF-10, RF-11), despachos (RF-12, RF-13).
- **Corte 3**: alertas operativas y realtime (RF-14 a RF-16), dashboard KPI (RF-17), exportación de reportes (RF-18), Swagger (RF-19), despliegue, pruebas de aceptación.

**Documentos de referencia** (en `docs/`):

- `docs/guia_nuclear_V_inventario_logistica.md` — **fuente de verdad primaria**. Define roles, módulos y entregables oficiales del proyecto. Si hay conflicto, gana la guía.
- `docs/ERS.md` — **especificación contractual detallada**. Si dudas sobre QUÉ hacer, consúltala. Tiene IDs `RF-XX` y `RNF-XX` que debes citar en commits y PRs.
- `docs/SGIL_documento_tecnico.md` — describe arquitectura, modelo de datos y plan por cortes. Consúltalo para CÓMO hacer.
- `docs/ADR.md` — decisiones arquitectónicas justificadas (9 ADRs).
- `docs/tradeoffs.md` — análisis de tradeoffs por ADR.

**Roles del sistema** (enum `rol_usuario` en BD):

| Rol | Valor BD | Permisos clave |
|---|---|---|
| Administrador del sistema | `admin_sistema` | Acceso total + gestión de usuarios (crear, activar, desactivar, asignar rol) |
| Jefe de almacén | `jefe_almacen` | Acceso operativo total + aprobación de despachos + dashboard KPI |
| Operador de recepción | `operador_recepcion` | Crear/consultar recepciones y lotes, consultar inventario |
| Operador de despacho | `operador_despacho` | Crear/consultar despachos (pendientes de aprobación), consultar inventario |

**Regla de oro**: si `ERS.md` y `SGIL_documento_tecnico.md` se contradicen, gana la ERS. Si alguno contradice la guía, gana la guía.

---

## 2. Stack obligatorio

No improvises tecnologías. Si algo no está aquí, **pregunta antes de instalarlo**.

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Next.js (App Router) | 15.x |
| Lenguaje | TypeScript (strict) | 5.x |
| Runtime | Node.js | 20 LTS |
| UI | Tailwind CSS + shadcn/ui | última estable |
| Estado servidor | TanStack Query | 5.x |
| Backend | Supabase (Postgres 16 + Auth + Realtime + Storage) | cloud |
| Validación | Zod | 3.x |
| Pruebas unitarias | Vitest | última |
| Pruebas E2E | Playwright | última |
| Excel | ExcelJS | última |
| PDF | jsPDF | última |
| Linter / formato | ESLint + Prettier | config Next.js |
| Gestor de paquetes | **pnpm** | 9.x |

**Prohibido** sin aprobación explícita: Redux, Prisma (usa el cliente Supabase), tRPC, Drizzle, MUI, Chakra, Bootstrap, librerías de gráficos pesadas (usa Recharts si necesitas charts), Docker (no se necesita en este proyecto).

---

## 3. Convenciones de código

### 3.1 Idioma

- **Código en español**: nombres de variables, funciones, tablas, columnas, tipos.
- **Excepción**: palabras técnicas que no se traducen (`user`, `id`, `createdAt` → usamos `creado_en`; `email` se queda; `JWT`, `RLS`, `FEFO` se quedan).
- Comentarios y mensajes de error: español.
- Strings de UI: español.

### 3.2 Nombres

| Tipo | Convención | Ejemplo |
|---|---|---|
| Archivos componente | PascalCase | `TablaProductos.tsx` |
| Archivos utilidad | kebab-case | `calcular-fefo.ts` |
| Carpetas | kebab-case | `recepcion-mercancia/` |
| Variables / funciones | camelCase | `obtenerLotesActivos()` |
| Tipos / interfaces | PascalCase | `type Producto`, `interface Lote` |
| Tablas Postgres | snake_case plural | `productos`, `ordenes_recepcion` |
| Columnas Postgres | snake_case | `fecha_vencimiento`, `cantidad_actual` |
| Enums Postgres | snake_case | `rol_usuario`, `estado_lote` |
| Constantes | UPPER_SNAKE_CASE | `DIAS_VENCIMIENTO_PROXIMO = 30` |
| Componentes shadcn | kebab-case carpeta, PascalCase export | `components/ui/button.tsx` |

### 3.3 TypeScript

- `strict: true` siempre. No `any` sin comentario justificando.
- Tipos generados desde Supabase: `pnpm db:types` regenera `lib/supabase/database.types.ts`.
- Esquemas de validación con Zod en `lib/schemas/`. Exporta el tipo con `z.infer`.
- No exportes tipos desde componentes; exporta desde `lib/types/` o `lib/schemas/`.

### 3.4 Estilo

- Imports ordenados: librerías externas → `@/` internos → relativos.
- Sin imports relativos profundos (`../../../`). Usa alias `@/`.
- Funciones puras en `lib/domain/`. Side effects solo en `lib/services/` y `lib/repositories/`.
- Componentes server por defecto. Agrega `"use client"` solo si necesitas hooks o eventos.

---

## 4. Estructura objetivo del repositorio

```
proyecto_nuclear_V/
├── .github/
│   └── workflows/
│       └── ci.yml
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # dashboard principal
│   │   ├── productos/
│   │   ├── lotes/
│   │   ├── recepcion/
│   │   ├── despachos/
│   │   ├── alertas/
│   │   └── reportes/
│   ├── api/
│   │   ├── health/route.ts
│   │   └── reportes/
│   │       ├── excel/route.ts
│   │       └── pdf/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn/ui (no editar a mano)
│   └── dominio/                        # componentes del negocio
│       ├── TablaProductos.tsx
│       ├── PanelAlertas.tsx
│       └── FormularioRecepcion.tsx
├── lib/
│   ├── domain/                         # reglas puras: FEFO, cálculo alertas
│   ├── services/                       # casos de uso
│   ├── repositories/                   # acceso a Supabase
│   ├── schemas/                        # Zod
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── database.types.ts           # autogenerado con pnpm db:types
│   ├── types/
│   └── utils.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20260501000000_init.sql
│   │   └── 20260511000000_corregir_roles.sql   # ver Paso 5.1
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
│   ├── ERS.md
│   ├── ADR.md
│   ├── tradeoffs.md
│   ├── SGIL_documento_tecnico.md
│   ├── guia_nuclear_V_inventario_logistica.md
│   ├── diagrama_relacion_bd.mermaid
│   └── diagrama_arquitectonico.mermaid
├── public/
├── .env.local.example
├── .gitignore
├── CLAUDE.md                           # este archivo
├── README.md
├── package.json
├── pnpm-lock.yaml
├── playwright.config.ts
├── vitest.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── components.json                     # shadcn config
└── next.config.ts
```

---

## 5. Plan de ejecución desde cero

Sigue **estos pasos en orden**. No saltes pasos. Después de cada paso haz commit.

### Paso 0 — Antes de empezar

Verifica versiones:

```bash
node --version    # debe ser >= 20
pnpm --version    # debe ser >= 9
```

Si falta `pnpm`: `npm install -g pnpm`.

### Paso 1 — Bootstrap Next.js ✅

```bash
pnpm create next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir=false \
  --import-alias "@/*" --use-pnpm
```

Cuando pregunte por Turbopack: **sí**.

Commit: `chore: bootstrap Next.js 15 con TypeScript y Tailwind`

### Paso 2 — Dependencias base ✅

```bash
pnpm add @supabase/supabase-js @supabase/ssr @tanstack/react-query zod
pnpm add -D @types/node vitest @vitest/coverage-v8 @playwright/test
```

shadcn/ui:

```bash
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button input label form table card dialog toast sonner
```

Commit: `chore: dependencias base y shadcn/ui`

### Paso 3 — Configuración de Supabase ✅

1. Crear proyecto en https://supabase.com (Free tier).
2. Copiar URL y keys al `.env.local` siguiendo `.env.local.example` (créalo tú primero).
3. Instalar Supabase CLI: `brew install supabase/tap/supabase` (Mac M1).
4. `supabase init` (genera `supabase/config.toml`).
5. `supabase login` y `supabase link --project-ref <ref>`.

`.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Crear clientes Supabase en `lib/supabase/server.ts` y `lib/supabase/client.ts` siguiendo la doc oficial de `@supabase/ssr` para Next.js App Router.

Crear `middleware.ts` en raíz para refrescar sesión.

Commit: `feat(supabase): configuración inicial de cliente y middleware`

### Paso 4 — Schema inicial (Corte 1) ✅ ⚠️ *roles incorrectos — ver Paso 5.1*

Crear migración `supabase/migrations/20260501000000_init.sql` con:

- Enum `rol_usuario` con valores `admin_sistema`, `jefe_almacen`, `operador_recepcion`, `operador_despacho`.
- Tabla `perfiles` (extiende `auth.users`) con `id`, `nombre`, `rol`, `activo`, `creado_en`.
- Default de `rol` = `'operador_despacho'` (rol más restrictivo como fallback seguro).
- Trigger para crear perfil al registrar usuario.
- RLS habilitado en `perfiles` con políticas básicas.

Aplicar:

```bash
supabase db push
pnpm db:types   # genera lib/supabase/database.types.ts
```

Agregar a `package.json`:

```json
"scripts": {
  "db:types": "supabase gen types typescript --linked > lib/supabase/database.types.ts"
}
```

Commit: `feat(db): schema inicial con perfiles y RLS`

### Paso 5 — Autenticación (RF-00, RF-01, RF-02, RF-03) ✅ ⚠️ *roles incorrectos en layout — ver Paso 5.1*

Crear:

- `app/(auth)/login/page.tsx` — formulario con email/contraseña, validación Zod.
- `app/(dashboard)/layout.tsx` — protege rutas, lee rol del usuario, redirige a `/login` si no hay sesión.
- `lib/services/auth.ts` — `iniciarSesion`, `cerrarSesion`, `obtenerUsuarioActual`, `requerirRol(rol[])`.
- `lib/schemas/auth.ts` — esquema Zod del formulario de login.
- `lib/types/auth.ts` — tipos `RolUsuario`, `PerfilUsuario`, `UsuarioActual`.

Validar contra ERS RF-00, RF-01, RF-02, RF-03.

Commit: `feat(auth): login, logout y control de acceso por rol`

---

### Paso 5.1 — Corrección de roles ⚠️ PENDIENTE — ejecutar antes del Paso 6

El Paso 4 se ejecutó con valores de enum incorrectos (`encargado`, `jefe_produccion`, `dueno`).  
El Paso 5 construyó sobre esos valores. Este paso los corrige completamente.

**Archivos afectados:**
- `supabase/migrations/` → nueva migración
- `lib/supabase/database.types.ts` → regenerar
- `app/(dashboard)/layout.tsx` → actualizar valores hardcodeados

#### 1. Crear migración correctiva

Crear `supabase/migrations/20260511000000_corregir_roles.sql`:

```sql
-- Renombrar los tres valores incorrectos a los correctos
ALTER TYPE public.rol_usuario RENAME VALUE 'encargado'      TO 'admin_sistema';
ALTER TYPE public.rol_usuario RENAME VALUE 'jefe_produccion' TO 'jefe_almacen';
ALTER TYPE public.rol_usuario RENAME VALUE 'dueno'           TO 'operador_despacho';

-- Agregar el cuarto valor que faltaba
ALTER TYPE public.rol_usuario ADD VALUE IF NOT EXISTS 'operador_recepcion';

-- Corregir el default de la columna rol
ALTER TABLE public.perfiles
  ALTER COLUMN rol SET DEFAULT 'operador_despacho';
```

Aplicar:

```bash
supabase db push
pnpm db:types
```

#### 2. Corregir `app/(dashboard)/layout.tsx`

Reemplazar los valores hardcodeados de roles en este archivo:

```typescript
// ANTES (incorrecto)
const rolesDashboard: readonly RolUsuario[] = [
  "encargado",
  "jefe_produccion",
  "dueno",
];

const etiquetasRol: Record<RolUsuario, string> = {
  encargado: "Encargado de inventarios",
  jefe_produccion: "Jefe de producción",
  dueno: "Dueño",
};

// DESPUÉS (correcto)
const rolesDashboard: readonly RolUsuario[] = [
  "admin_sistema",
  "jefe_almacen",
  "operador_recepcion",
  "operador_despacho",
];

const etiquetasRol: Record<RolUsuario, string> = {
  admin_sistema: "Administrador del sistema",
  jefe_almacen: "Jefe de almacén",
  operador_recepcion: "Operador de recepción",
  operador_despacho: "Operador de despacho",
};
```

#### 3. Verificar que no queden referencias a roles viejos

```bash
grep -r "encargado\|jefe_produccion\|dueno" app/ lib/ --include="*.ts" --include="*.tsx"
```

El resultado debe estar vacío. Si aparece algo, corregirlo antes de continuar.

#### 4. Verificar que TypeScript compila sin errores

```bash
pnpm build
```

Commit: `fix(db): corregir enum rol_usuario a los cuatro roles oficiales`

```
Refs: RF-00, RF-02, RNF-03
```

---

### Paso 6 — Layout del dashboard y páginas prototipo

Este paso cubre **dos entregables del Corte 1** según la guía del proyecto nuclear:
- Entregable A: layout base con navegación por rol (fundación técnica).
- Entregable B: wireframes/prototipos interactivos de las pantallas principales (Programación con Tecnologías Web).

#### 6a — Layout base

- Sidebar con navegación cuya visibilidad está condicionada al rol del usuario.
- Header con nombre del usuario, etiqueta del rol y botón de logout.
- Página principal `/` con bienvenida y resumen del rol activo.

**Visibilidad de enlaces y acciones por rol:**

| Sección / Acción | `admin_sistema` | `jefe_almacen` | `operador_recepcion` | `operador_despacho` | Fuente |
|---|---|---|---|---|---|
| Gestión de usuarios | ✅ | ❌ | ❌ | ❌ | RF-00 |
| Productos — ver lista | ✅ | ✅ | ✅ | ✅ | RF-05 |
| Productos — crear/editar/baja | ✅ | ✅ | ❌ | ❌ | RF-04, RF-06 |
| Productos — punto de reorden | ✅ | ✅ | ❌ | ❌ | RF-07 |
| Lotes — ver lista | ✅ | ✅ | ✅ | ✅ | RF-09 |
| Inventario — stock actual | ✅ | ✅ | ✅ | ✅ | RF-05 |
| Recepción — ver historial | ✅ | ✅ | ✅ | ✅ | RF-11 |
| Recepción — crear orden | ✅ | ✅ | ✅ | ❌ | RF-10 |
| Despachos — ver historial | ✅ | ✅ | ✅ | ✅ | RF-13 |
| Despachos — crear | ✅ | ✅ | ❌ | ✅ | RF-12 |
| Despachos — aprobar | ✅ | ✅ | ❌ | ❌ | RF-12 |
| Alertas — panel | ✅ | ✅ | ✅ | ✅ | RF-16 |
| Dashboard KPI | ✅ | ✅ | ❌ | ❌ | RF-17 |
| Reportes — exportar | ✅ | ✅ | ❌ | ❌ | RF-18 |

> **Regla de implementación:** la columna de navegación oculta los *botones de acción* (crear, aprobar, exportar) cuando el rol no tiene permiso. Las páginas de consulta/lista (historial de recepciones, historial de despachos) son accesibles para todos los roles — solo se oculta el botón "Nueva recepción" u "Nuevo despacho" según corresponda.

Commit: `feat(ui): layout principal del dashboard con navegación por rol`

#### 6b — Páginas prototipo (wireframes interactivos)

Crear una página prototipo por cada módulo principal. Son páginas con UI real (componentes shadcn) pero **sin datos reales** — usan datos estáticos o estructuras vacías. El objetivo es mostrar la arquitectura visual del sistema y validarla con Ingeniería Industrial.

**Pantallas requeridas por la guía del proyecto nuclear:**

| Ruta | Archivo | Qué mostrar |
|---|---|---|
| `/inventario` | `app/(dashboard)/inventario/page.tsx` | Tabla de productos con columnas: código, nombre, categoría, stock total, estado de alerta. Barra de búsqueda y filtro por categoría. Botón "Nuevo producto" (visible solo para `admin_sistema` y `jefe_almacen`). |
| `/recepcion` | `app/(dashboard)/recepcion/page.tsx` | Tabla de órdenes de recepción con columnas: número de orden, factura, fecha, estado. Botón "Nueva recepción" (visible para `admin_sistema`, `jefe_almacen`, `operador_recepcion`). |
| `/despachos` | `app/(dashboard)/despachos/page.tsx` | Tabla de despachos con columnas: fecha, destino interno, estado, unidades. Botón "Nuevo despacho" (visible para `admin_sistema`, `jefe_almacen`, `operador_despacho`). Botón "Aprobar" por fila (visible solo para `admin_sistema` y `jefe_almacen`). |
| `/reportes` | `app/(dashboard)/reportes/page.tsx` | Cards con los cuatro KPIs: rotación de inventario, exactitud, nivel de servicio, utilización de almacén. Gráficos vacíos (placeholder con Recharts). Accesible solo para `admin_sistema` y `jefe_almacen`. |

**Reglas para las páginas prototipo:**
- Usar componentes `Card`, `Table`, `Badge`, `Button` de shadcn/ui.
- Los datos son arrays TypeScript estáticos definidos en el mismo archivo — no llamadas a Supabase.
- Cada página debe llamar a `requerirRol([...])` con los roles permitidos para que el guard de acceso funcione desde ya.
- Las páginas quedarán funcionales en apariencia; en Corte 2 se reemplazarán los datos estáticos por datos reales de Supabase.

Commit: `feat(ui): páginas prototipo de inventario, recepción, despachos y reportes`

```
Refs: RF-04, RF-05, RF-10, RF-11, RF-12, RF-13, RF-17
```

### Paso 7 — Pruebas y CI

- `vitest.config.ts` con cobertura.
- Una prueba unitaria en `tests/unit/` del helper `requerirRol`.
- `playwright.config.ts` y prueba E2E del flujo de login/logout.
- `.github/workflows/ci.yml`: lint + typecheck + test en cada PR.

Commit: `chore: configuración de pruebas y CI`

### Paso 8 — Cierre del Corte 1

- Documentar en `README.md` cómo arrancar local (`pnpm install`, `.env.local`, `supabase db push`, `pnpm dev`).
- Verificar que `pnpm build` pasa sin errores ni warnings de TypeScript.
- Verificar despliegue en Vercel preview.

Commit + tag: `v0.1.0-corte1`

### Paso 9 — Alineación arquitectónica y trazabilidad ERS/ADR ✅ *completado 2026-05-11*

Los documentos `docs/ADR.md`, `docs/tradeoffs.md`, `docs/SGIL_documento_tecnico.md`, `docs/diagrama_relacion_bd.mermaid` y `docs/diagrama_arquitectonico.mermaid` ya fueron actualizados y alineados.

Si en futuros cortes se introducen nuevas decisiones arquitectónicas, crear un ADR-010 o superior y actualizar el resumen en `docs/ADR.md`. Nunca eliminar ADRs previos; si una decisión cambia, marcarla como `[Reemplazado]`.

Commit: `docs: alineación de trazabilidad entre ERS, ADR y documento técnico`

---

## 6. Reglas duras (NO violar)

1. **No instalar dependencias** fuera de la lista en sección 2 sin preguntar primero.
2. **No editar archivos en `components/ui/`** manualmente — son generados por shadcn. Si necesitas modificarlos, crea un wrapper en `components/dominio/`.
3. **No usar el cliente service-role** (`SUPABASE_SERVICE_ROLE_KEY`) en código que se ejecute en el navegador. Solo en route handlers y server actions.
4. **No commitear `.env.local`** ni keys reales. Solo `.env.local.example` con valores vacíos.
5. **No usar `any`** salvo con comentario `// eslint-disable-next-line — razón:`.
6. **No editar tablas desde el dashboard de Supabase** en producción. Todo cambio de schema va por migración versionada en `supabase/migrations/`.
7. **No hacer `git push --force`** a `main`. Trabaja en branches `feat/*`, `fix/*`, `chore/*`.
8. **No implementar funcionalidad fuera del corte actual.** Si estás en Corte 1, no agregues módulos de Corte 2 aunque sea tentador. Pregunta si crees que un cambio adelantado se justifica.
9. **Stock nunca negativo**: cualquier función que modifique stock debe validar antes de aplicar.
10. **No regenerar `database.types.ts` a mano** — siempre con `pnpm db:types` tras una migración.

---

## 7. Cómo escribir commits

Convención **Conventional Commits** + referencia a RF/RNF cuando aplique.

Formato:
```
<tipo>(<scope>): <descripción corta>

<cuerpo opcional>

Refs: RF-XX, RNF-XX
```

Tipos: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`.

Ejemplos:
```
feat(auth): login con email y contraseña

Implementa formulario de inicio de sesión con validación Zod.
Almacena JWT en cookie httpOnly vía @supabase/ssr.

Refs: RF-01, RNF-03
```

```
fix(db): corregir enum rol_usuario a los cuatro roles oficiales

Refs: RF-00, RF-02, RNF-03
```

```
feat(db): tabla lotes con trazabilidad FEFO

Refs: RF-08, RF-09
```

---

## 8. Cómo pedir aclaraciones

Si una tarea es ambigua o entra en conflicto con la ERS:

1. **No improvises.** Para y pregunta.
2. Cita el RF/RNF relevante de `docs/ERS.md`.
3. Propón 2-3 opciones concretas con trade-offs.

Ejemplo:
> La ERS en RF-08 dice que la fecha de vencimiento debe ser posterior a la recepción "más el límite mínimo definido para ese producto". El límite solo está confirmado para harina (3 meses). ¿Cómo manejo los demás productos?
> a) Permitir cualquier fecha futura hasta que se definan límites por categoría.
> b) Aplicar un default global (ej: 30 días) configurable luego.
> c) Bloquear el registro hasta que el usuario configure el límite.

---

## 9. Recursos rápidos

- Next.js App Router: https://nextjs.org/docs/app
- Supabase + Next.js: https://supabase.com/docs/guides/auth/server-side/nextjs
- shadcn/ui: https://ui.shadcn.com
- TanStack Query: https://tanstack.com/query/latest
- Vitest: https://vitest.dev
- Playwright: https://playwright.dev

---

## 10. Estado actual del proyecto

> **Mantén esta sección actualizada al cerrar cada paso/corte.**

- [x] Paso 1 — Bootstrap Next.js
- [x] Paso 2 — Dependencias base
- [x] Paso 3 — Configuración Supabase
- [x] Paso 4 — Schema inicial ⚠️ *ejecutado con roles incorrectos — corregir en Paso 5.1*
- [x] Paso 5 — Autenticación ⚠️ *layout.tsx usa roles incorrectos — corregir en Paso 5.1*
- [x] **Paso 5.1 — Corrección de roles** ✅ *enum y types corregidos — 2026-05-11*

> **⚠️ TEMPORAL activo — limpiar antes del Paso 8 (cierre Corte 1):**
> - `supabase/migrations/20260511000001_seed_temporal.sql` — eliminar archivo y usuarios con el botón del dashboard.
> - `lib/services/seed.ts` — eliminar archivo completo.
> - `lib/supabase/admin.ts` — eliminar si no se usa en otro lugar.
> - `app/(dashboard)/layout.tsx` — eliminar el bloque marcado con `⚠️ TEMPORAL`.
- [x] Paso 6 — Layout dashboard ✅ *sidebar por rol + 4 páginas prototipo — 2026-05-11*
- [ ] Paso 7 — Pruebas y CI
- [ ] Paso 8 — Cierre Corte 1
- [x] Paso 9 — Alineación arquitectónica y trazabilidad ERS/ADR

**Corte actual:** 1
**Última actualización:** 2026-05-11 — Paso 6 completado. Layout con sidebar por rol y páginas prototipo de inventario, recepción, despachos y reportes. Paso 7 es el próximo.
