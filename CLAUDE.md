# CLAUDE.md — proyecto_nuclear_V (SGIL)

Este archivo es la **fuente de instrucciones operativas** para Claude Code en este repositorio. Léelo completo antes de cualquier tarea. Si una instrucción aquí choca con tu intuición general, prevalece este archivo.

---

## 1. Contexto del proyecto

**Sistema de Gestión de Inventario y Logística (SGIL)** para un centro de distribución de pastelería. Proyecto académico de la Corporación Universitaria Alexander von Humboldt, semestre I-2026.

El proyecto se entrega en **tres cortes académicos** (21 abril → 26 junio 2026):

- **Corte 1**: autenticación, control de acceso, fundación del proyecto.
- **Corte 2**: productos, lotes, recepción, despachos, alertas, realtime.
- **Corte 3**: dashboard KPI, exportación de reportes, despliegue, pruebas.

**Documentos de referencia** (en `docs/`):

- `docs/ERS.md` — **fuente de verdad contractual**. Si dudas sobre QUÉ hacer, consúltala. Tiene IDs `RF-XX` y `RNF-XX` que debes citar en commits y PRs.
- `docs/documento_tecnico.md` — describe arquitectura, modelo de datos y plan por cortes. Consúltalo para CÓMO hacer.

**Regla de oro**: si `ERS.md` y `documento_tecnico.md` se contradicen, gana la ERS.

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
│   │   └── database.types.ts           # autogenerado
│   ├── types/
│   └── utils.ts
├── supabase/
│   ├── migrations/
│   │   └── 20260501000000_init.sql
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
│   ├── ERS.md
│   ├── documento_tecnico.md
│   └── README.md
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

### Paso 1 — Bootstrap Next.js

```bash
pnpm create next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir=false \
  --import-alias "@/*" --use-pnpm
```

Cuando pregunte por Turbopack: **sí**.

Commit: `chore: bootstrap Next.js 15 con TypeScript y Tailwind`

### Paso 2 — Dependencias base

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

### Paso 3 — Configuración de Supabase

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

### Paso 4 — Schema inicial (Corte 1)

Crear migración `supabase/migrations/20260501000000_init.sql` con:

- Enum `rol_usuario` con valores `encargado`, `jefe_produccion`, `dueno`.
- Tabla `perfiles` (extiende `auth.users`) con `id`, `nombre`, `rol`, `activo`, `creado_en`.
- Trigger para crear perfil al registrar usuario.
- RLS habilitado en `perfiles` con políticas básicas.

Aplicar:

```bash
supabase db push
pnpm db:types   # script en package.json que genera lib/supabase/database.types.ts
```

Agregar a `package.json`:

```json
"scripts": {
  "db:types": "supabase gen types typescript --linked > lib/supabase/database.types.ts"
}
```

Commit: `feat(db): schema inicial con perfiles y RLS`

### Paso 5 — Autenticación (RF-01, RF-02, RF-03)

Crear:

- `app/(auth)/login/page.tsx` — formulario con email/contraseña, validación Zod.
- `app/(dashboard)/layout.tsx` — protege rutas, lee rol del usuario, redirige a `/login` si no hay sesión.
- `lib/services/auth.ts` — `iniciarSesion`, `cerrarSesion`, `obtenerUsuarioActual`.
- Helper `requerirRol(rol[])` para guards en server components.

Validar contra ERS RF-01, RF-02, RF-03.

Commit: `feat(auth): login, logout y control de acceso por rol`

### Paso 6 — Layout del dashboard

- Sidebar con navegación (visibilidad condicionada por rol).
- Header con usuario actual y botón logout.
- Página vacía `/` con bienvenida.

Para rol `dueno`: ocultar enlaces a acciones de edición.

Commit: `feat(ui): layout principal del dashboard`

### Paso 7 — Pruebas y CI

- `vitest.config.ts` con cobertura.
- Una prueba de ejemplo en `tests/unit/` del helper de roles.
- `playwright.config.ts` y prueba E2E del login.
- `.github/workflows/ci.yml`: lint + typecheck + test en cada PR.

Commit: `chore: configuración de pruebas y CI`

### Paso 8 — Cierre del Corte 1

- Documentar en `README.md` cómo arrancar local.
- Verificar que `pnpm build` pasa sin errores.
- Verificar despliegue en Vercel preview.

Commit + tag: `v0.1.0-corte1`

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
- [ ] Paso 3 — Configuración Supabase
- [ ] Paso 4 — Schema inicial
- [ ] Paso 5 — Autenticación
- [ ] Paso 6 — Layout dashboard
- [ ] Paso 7 — Pruebas y CI
- [ ] Paso 8 — Cierre Corte 1

**Corte actual:** 1
**Última actualización:** 2026-05-11 — Paso 2 completado (dependencias base, shadcn/ui, puerto 5175)