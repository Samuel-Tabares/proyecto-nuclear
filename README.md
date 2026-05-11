# SGIL - Sistema de Gestión de Inventario y Logística

SGIL es una aplicación web para digitalizar la gestión de inventario, lotes,
recepción de mercancía, despachos internos, alertas operativas y reportes de un
centro de distribución de pastelería.

El proyecto corresponde al Proyecto Nuclear 3 de Ingeniería de Software,
semestre I-2026, para la Corporación Universitaria Alexander von Humboldt.

## Estado actual

El repositorio ya tiene configurada la base del proyecto:

- Aplicación Next.js con App Router.
- TypeScript en modo estricto.
- Tailwind CSS y componente base de shadcn/ui.
- Clientes Supabase para navegador y servidor.
- Proyecto Supabase enlazado.
- Migración inicial aplicada para `perfiles`, `rol_usuario`, trigger de perfil y RLS.
- Tipos de Supabase generados en `lib/supabase/database.types.ts`.
- Diagrama arquitectónico de alto nivel en Mermaid.

## Documentación principal

| Documento | Propósito |
|---|---|
| [docs/ERS.md](docs/ERS.md) | Fuente de verdad contractual: requisitos funcionales, no funcionales, roles y alcance. |
| [docs/SGIL_documento_tecnico.md](docs/SGIL_documento_tecnico.md) | Arquitectura, stack, modelo de datos, seguridad, despliegue y plan por cortes. |
| [docs/ADR.md](docs/ADR.md) | Decisiones arquitectónicas aceptadas y alternativas descartadas. |
| [docs/tradeoffs.md](docs/tradeoffs.md) | Compromisos técnicos asumidos y su justificación. |
| [docs/diagrama_arquitectonico.mermaid](docs/diagrama_arquitectonico.mermaid) | Diagrama arquitectónico en Mermaid para exportar o renderizar en herramientas externas. |

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.6 con App Router |
| Lenguaje | TypeScript 5 |
| UI | Tailwind CSS 4 + shadcn/ui |
| Estado servidor | TanStack Query 5 |
| Backend gestionado | Supabase Cloud |
| Base de datos | PostgreSQL 16 con Row Level Security |
| Autenticación | Supabase Auth con JWT y cookies gestionadas por `@supabase/ssr` |
| Tiempo real | Supabase Realtime |
| Validación | Zod 4 |
| Pruebas | Vitest y Playwright |
| Reportes | ExcelJS y jsPDF |
| Despliegue previsto | Vercel + Supabase Cloud |

## Roles del sistema

| Rol | Permisos principales |
|---|---|
| Encargado de Inventarios | Crear, editar, consultar, aprobar despachos y generar reportes. |
| Jefe de Producción | Crear, editar, consultar inventario y generar reportes. |
| Dueños | Consultar inventario, dashboard, indicadores y reportes en modo solo lectura. |

## Módulos del MVP

- Autenticación y control de acceso por rol.
- Gestión de productos.
- Gestión de lotes con trazabilidad.
- Recepción de mercancía.
- Despachos internos con política FEFO.
- Alertas de stock mínimo y vencimiento próximo.
- Dashboard de KPIs.
- Exportación de reportes en Excel y PDF.

## Arquitectura

La solución se implementa como una aplicación full-stack en Next.js. La
separación entre frontend y backend es lógica, no física, siguiendo cuatro
capas:

- **Presentación:** rutas App Router y componentes React.
- **Aplicación:** casos de uso, Route Handlers y Server Actions.
- **Dominio:** reglas puras como FEFO, alertas, stock y validaciones.
- **Infraestructura:** clientes Supabase, repositorios y acceso a servicios externos.

Supabase concentra autenticación, PostgreSQL, RLS, Realtime y Storage. La base
de datos es la fuente de verdad; Realtime solo se usa para notificar cambios y
refrescar la interfaz.

Ver el diagrama en
[docs/diagrama_arquitectonico.mermaid](docs/diagrama_arquitectonico.mermaid).

## Estructura relevante

```text
proyecto_nuclear_V/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── database.types.ts
│   └── utils.ts
├── supabase/
│   ├── migrations/
│   │   └── 20260501000000_init.sql
│   └── config.toml
├── docs/
│   ├── ADR.md
│   ├── ERS.md
│   ├── SGIL_documento_tecnico.md
│   ├── tradeoffs.md
│   └── diagrama_arquitectonico.mermaid
├── .env.local.example
├── CLAUDE.md
└── package.json
```

## Requisitos locales

- Node.js 20 LTS o superior.
- pnpm 9 o superior.
- Supabase CLI.
- Acceso al proyecto Supabase del equipo para migraciones y generación de tipos.

## Variables de entorno

Crear `.env.local` a partir de `.env.local.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

La clave `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en código servidor
confiable. Nunca debe exponerse en componentes cliente ni en variables
`NEXT_PUBLIC_*`.

## Comandos

Instalar dependencias:

```bash
pnpm install
```

Levantar desarrollo:

```bash
pnpm dev
```

Abrir la aplicación en:

```text
http://localhost:5175
```

Ejecutar lint:

```bash
COREPACK_ENABLE_AUTO_PIN=0 pnpm lint
```

Compilar producción:

```bash
COREPACK_ENABLE_AUTO_PIN=0 pnpm build
```

Generar tipos desde Supabase:

```bash
pnpm db:types
```

## Supabase

El esquema se versiona con migraciones SQL en `supabase/migrations/`. La
migración inicial crea:

- Enum `rol_usuario`: `encargado`, `jefe_produccion`, `dueno`.
- Tabla `perfiles` vinculada a `auth.users`.
- Trigger para crear perfil al registrar usuario.
- RLS habilitado en `perfiles`.
- Políticas básicas para lectura del perfil propio y actualización de nombre.

Para aplicar migraciones:

```bash
supabase db push
```

Después de modificar el esquema, regenerar tipos:

```bash
pnpm db:types
```

## Convenciones importantes

- Código, nombres de dominio y mensajes de UI en español.
- Tablas y columnas PostgreSQL en `snake_case`.
- Componentes de negocio en `components/dominio/`.
- Reglas puras en `lib/domain/`.
- Acceso a datos en `lib/repositories/`.
- Clientes Supabase en `lib/supabase/`.
- No editar tablas manualmente desde el dashboard de Supabase; usar migraciones.
- No commitear `.env.local` ni claves reales.

## Verificación actual

Validaciones ejecutadas durante la configuración inicial:

```bash
COREPACK_ENABLE_AUTO_PIN=0 pnpm lint
COREPACK_ENABLE_AUTO_PIN=0 pnpm build
```

Ambas pasan con la configuración actual. El build requiere acceso de red si
Next necesita descargar fuentes mediante `next/font`.
