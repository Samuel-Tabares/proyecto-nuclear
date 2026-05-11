# Architecture Decision Records (ADR)

## Sistema de Gestión de Inventario y Logística (SGIL)

**Proyecto Nuclear 3**

- **Institución:** Corporación Universitaria Alexander von Humboldt
- **Programa:** Ingeniería de Software — Semestre I-2026
- **Asignatura:** Arquitectura de Software I — Docente: Santiago Jaramillo L.
- **Ubicación:** Armenia, Quindío
- **Fecha:** Mayo 2026

---

## 1. Introducción

Un Architecture Decision Record (ADR) es un documento corto que captura una decisión arquitectónica significativa: el contexto en que se tomó, las alternativas que se evaluaron, la opción elegida y sus consecuencias positivas y negativas. Su propósito es registrar el razonamiento detrás del diseño del sistema, no solo el resultado final.

Los ADRs se almacenan en el repositorio bajo `docs/adr/` con numeración secuencial. Nunca se eliminan; si una decisión cambia, el ADR anterior se marca como `[Reemplazado]` y se crea uno nuevo.

### 1.1 Contexto del sistema

El SGIL es un sistema web de gestión de inventario y logística para un centro de distribución de productos de pastelería (tortas caseras, galletería, bizcocho y postres) en el Quindío. Los requisitos funcionales y reglas de negocio fueron levantados con los estudiantes de Ingeniería Industrial que realizan su práctica en el centro de distribución.

**Información clave del dominio confirmada por Ingeniería Industrial:**

- El inventario se controla actualmente en Excel de forma manual; el conteo físico es diario.
- La bodega está organizada en **tres espacios**: bodega principal, bodega de producción y área de neveras/refrigerados.
- Los productos se ubican según frecuencia de uso (criterio ABC) y si requieren refrigeración.
- Se puede recibir mercancía **sin orden de compra previa**, aunque es poco frecuente.
- El picking se prioriza por fechas especiales, stock actual, pedidos pendientes y escasez.
- El despacho al cliente final se realiza desde el punto de venta — **fuera del alcance** del sistema.
- Los productos tienen fecha de vencimiento con margen mínimo al recibirlos (ej. harina: ≥ 3 meses).

---

## 2. Decisiones Arquitectónicas

### ADR-001 — Adoptar arquitectura en capas con separación lógica frontend/backend

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

El equipo está conformado por estudiantes de Ingeniería de Software con disponibilidad de aproximadamente 10 semanas (tres cortes académicos). El sistema requiere una interfaz web desde PC de escritorio, control de acceso por roles y múltiples módulos funcionales. Los atributos de calidad más importantes son la mantenibilidad (necesaria para entregables por corte) y la facilidad de pruebas (exigida por Pruebas de Software). El equipo no tiene experiencia previa gestionando infraestructura distribuida.

**Decisión**

Se adopta una arquitectura en cuatro capas lógicas:

1. **Presentación** — componentes React renderizados por Next.js (Server y Client Components).
2. **Aplicación** — casos de uso en Route Handlers (`app/api/`) y Server Actions.
3. **Dominio** — reglas de negocio puras en `lib/domain/` (FEFO, cálculo de alertas, validaciones y reglas operativas como punto de reorden, stock mínimo y vencimiento).
4. **Infraestructura** — repositorios que encapsulan el acceso a Supabase en `lib/repositories/`.

Las capas se separan **lógicamente** en un único proyecto Next.js (no en dos repositorios). Esto se justifica con detalle en ADR-006. La comunicación entre cliente y servidor usa JSON sobre HTTP; el cliente nunca contiene lógica de negocio.

**Alternativas descartadas**

- **Microservicios:** complejidad operativa (múltiples servicios, comunicación por red, orquestación) supera la capacidad del equipo y el tiempo disponible.
- **Monolito MVC con renderizado en servidor sin SPA:** se descartó porque limita la interactividad del dashboard y dificulta las pruebas de UI aisladas.
- **Frontend y backend en repositorios separados:** se descartó por el costo de gestionar CORS, dos pipelines de despliegue y duplicación de tipos. La separación física no aporta valor real para un equipo pequeño con plazos cortos (ver ADR-006).

**Consecuencias**

*Positivas:* Separación clara de responsabilidades por capas. La lógica de dominio es testeable de forma aislada. Un único pipeline de CI/CD. Los tipos generados desde la base de datos son compartidos entre cliente y servidor sin duplicación.

*Negativas:* La separación lógica depende de disciplina del equipo; no hay un compilador que prohíba mezclar capas. Hay que mantener convención clara de qué archivos pueden importar qué (formalizada en `CLAUDE.md`).

---

### ADR-002 — Usar Supabase (PostgreSQL gestionado) como capa de datos

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

El dominio de inventario requiere relaciones fuertes entre entidades: un producto tiene varios lotes, cada lote ocupa una bodega (principal, producción o neveras), cada lote genera movimientos de entrada o salida, y cada movimiento pertenece a una orden de recepción o a un despacho. La integridad referencial es crítica: si un despacho descuenta stock del lote incorrecto, el sistema generará información errónea que impacta directamente la operación real de la empresa. Adicionalmente, el sistema debe generar reportes consolidados que cruzan varias tablas (rotación, nivel de servicio, ocupación por bodega).

**Decisión**

Se utiliza **Supabase** como capa de datos. Supabase provee PostgreSQL 16 gestionado, autenticación, Realtime y Storage. El acceso a datos se hace mediante el cliente tipado de Supabase, encapsulado en repositorios (`lib/repositories/`) que aplican el patrón Repository — la lógica de dominio no depende del cliente concreto y puede mockearse en pruebas.

El esquema incluye una tabla `bodegas` con tipo (`principal`, `produccion`, `neveras`) para reflejar la organización física confirmada por Ingeniería Industrial. Las migraciones se versionan en `supabase/migrations/` junto al código.

Las operaciones que tocan stock (recepción, despacho, ajuste) se ejecutan en **funciones PL/pgSQL transaccionales** dentro de Postgres para garantizar atomicidad y prevenir condiciones de carrera bajo concurrencia.

**Alternativas descartadas**

- **MongoDB (NoSQL):** el modelo es altamente relacional y requiere transacciones ACID. La flexibilidad de esquema no aporta valor.
- **MySQL:** alternativa técnicamente válida, pero PostgreSQL ofrece mejor manejo de consultas complejas, tipos de datos avanzados (enum, jsonb), Row Level Security nativo (ver ADR-008) y un ecosistema más rico.
- **PostgreSQL autogestionado en VPS:** se descartó por el costo operativo de mantener la BD, backups, actualizaciones y monitoreo. Supabase entrega todo eso gestionado en su plan gratuito.
- **ORM tradicional (Prisma, Drizzle):** se descartó porque Supabase ya genera tipos TypeScript directamente desde el esquema (`pnpm db:types`), y añadir un ORM introduce una capa de abstracción que duplica funcionalidad sin beneficio claro para este alcance.

**Consecuencias**

*Positivas:* Integridad referencial garantizada por claves foráneas. Transacciones ACID en operaciones de stock. Tipos TypeScript autogenerados desde el esquema reducen errores. Despliegue de BD sin esfuerzo operativo. Sin lock-in fuerte: el esquema es PostgreSQL estándar y se puede migrar a un Postgres autogestionado en el futuro.

*Negativas:* Dependencia de un proveedor (Supabase). Funcionalidades específicas como Realtime o RLS están atadas a su implementación. Si el proveedor cambia precios o políticas, hay que migrar — mitigable porque el esquema es portable.

---

### ADR-003 — Autenticar usuarios con Supabase Auth (JWT)

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

El sistema tiene tres roles con permisos distintos: Encargado de Inventarios (acceso total), Jefe de Producción (acceso total) y Dueños (solo lectura). Se necesita un mecanismo de autenticación que transporte el rol del usuario en cada petición, sea compatible con Next.js (Server Components, Route Handlers, middleware), y no requiera mantener estado de sesión en el servidor de aplicación.

**Decisión**

Se utiliza **Supabase Auth** para emitir y validar JWT. El flujo es:

1. El usuario se autentica con correo y contraseña contra Supabase Auth.
2. Supabase genera un access token (JWT) firmado con su clave privada y un refresh token. El access token incluye el `user_id` y, mediante un *custom claim*, el `rol` del usuario.
3. El cliente almacena los tokens en cookies httpOnly gestionadas por `@supabase/ssr`.
4. En cada petición, el middleware de Next.js y los Server Components validan la sesión llamando a Supabase. Si el access token expiró, `@supabase/ssr` lo renueva automáticamente con el refresh token.
5. El rol del usuario se lee del JWT y se aplica como guard en Route Handlers y como filtro en la UI.
6. Como segunda capa de autorización, se aplica Row Level Security a nivel de Postgres (ver ADR-008).

Las contraseñas se almacenan como hash bcrypt (gestionado por Supabase Auth). Los access tokens expiran en 1 hora (default); los refresh tokens permiten mantener la sesión hasta 8 horas alineadas con la jornada operativa, configurable en el dashboard.

**Alternativas descartadas**

- **Implementar autenticación propia con JWT + bcrypt:** se descartó por el costo de implementar y mantener correctamente login, hashing, rotación de tokens y recuperación de contraseña. Supabase Auth entrega todo eso probado.
- **Sesiones en servidor con cookies:** se descartó por incompatibilidad con la naturaleza distribuida de Vercel (instancias serverless) y porque Supabase Auth ya resuelve la sesión con cookies httpOnly seguras.
- **OAuth2 con proveedor externo (Google, GitHub):** sobreingeniería para el MVP (YAGNI). Puede agregarse después sin cambiar la arquitectura porque Supabase Auth lo soporta nativamente.

**Consecuencias**

*Positivas:* No se implementa código propio de autenticación, reduciendo superficie de error y vulnerabilidad. Refresh tokens automáticos eliminan la fricción de re-login durante la jornada. El rol viaja en el JWT y se valida sin consultar la BD en cada petición. Si en el futuro se requiere OAuth o magic link, se activa desde el dashboard de Supabase.

*Negativas:* La duración del access token (1 h por defecto) implica que si se cambia el rol de un usuario en BD, el cambio no se refleja hasta el siguiente refresh. Para roles que rara vez cambian este trade-off es aceptable. Si se requiere revocación inmediata, hay que invocar `supabase.auth.admin.signOut(userId)`.

---

### ADR-004 — Aplicar política FEFO en despachos usando el patrón Strategy

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

El centro de distribución maneja productos perecederos (tortas, galletas, bizcochos, postres) con fecha de vencimiento. Existe un margen mínimo de recepción por producto (ej: harina ≥ 3 meses antes del vencimiento). Ingeniería Industrial confirmó que el picking se prioriza también por fechas especiales y pedidos urgentes, lo que significa que la política de selección de lotes debe ser configurable. Despachar primero los productos con fecha de vencimiento más lejana generaría pérdidas por productos vencidos en bodega.

**Decisión**

Se implementa la política **FEFO (First Expired, First Out)** como estrategia por defecto: al registrar un despacho interno, el sistema selecciona automáticamente el lote con la fecha de vencimiento más próxima.

La misma política FEFO también se utiliza como criterio de visualización en la consulta de lotes (RF-09), ordenando los lotes por fecha de vencimiento más próxima.

```typescript
interface PoliticaDespacho {
  seleccionarLotes(disponibles: Lote[], cantidad: number): SeleccionLote[];
}

class PoliticaFEFO implements PoliticaDespacho { /* ... */ }
class PoliticaFIFO implements PoliticaDespacho { /* ... */ }
class PoliticaManual implements PoliticaDespacho { /* ... */ }
```

El módulo de despacho recibe la política como dependencia, permitiendo agregar nuevas estrategias (picking urgente, FIFO para un producto específico, selección manual) sin modificar el código del despacho. En la interfaz se muestra explícitamente qué lote se está despachando para que el operario lo confirme.

**Alternativas descartadas**

- **FIFO puro (First In, First Out):** no considera la fecha de vencimiento; podría despachar un lote reciente y dejar vencer uno más antiguo con fecha de vencimiento cercana.
- **Selección manual por el operario:** incrementa el riesgo de error humano, identificado como problema real en el proceso actual.
- **Lógica FEFO directamente en una función PL/pgSQL sin Strategy:** se descartó porque acopla la política a la base de datos y dificulta agregar variantes (picking urgente). La selección del lote se hace en TS; la transacción de descuento de stock sí va en PL/pgSQL.

**Consecuencias**

*Positivas:* Reduce pérdidas por productos vencidos, alineado con la operación real del cliente. El patrón Strategy cumple el principio Open/Closed de SOLID: agregar una política nueva no toca el módulo de despacho. La lógica de selección es testeable unitariamente sin levantar base de datos.

*Negativas:* Requiere que todos los lotes tengan registrada la fecha de vencimiento correctamente al recibirse; si se omite, FEFO no aplica. La selección automática puede confundir al operario si no se comunica claramente cuál lote se está despachando. Casos de picking por pedido urgente o fecha especial requieren una política de excepción manual con justificación registrada.

---

### ADR-005 — Exportar reportes operativos en formato Excel (.xlsx)

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

Ingeniería Industrial confirmó que el centro de distribución trabaja actualmente con Excel para todos sus registros: inventario, conteo diario, control de lotes y planificación de producción. El cliente necesita reportes que pueda seguir editando, filtrar y compartir por correo después de descargarlos. Los tres roles (Dueños, Jefe de Producción, Encargado de Inventarios) deben poder acceder a los reportes. La guía del Proyecto Nuclear también exige reportes en PDF y/o Excel.

**Decisión**

Los reportes de indicadores operativos (rotación de inventario, nivel de servicio, utilización por bodega) se generan en formato `.xlsx` usando **ExcelJS** en un Route Handler de Next.js (`app/api/reportes/excel/route.ts`) con runtime Node.js (no Edge, porque ExcelJS depende de APIs de Node).

El sistema también ofrece exportación en PDF mediante jsPDF como alternativa de solo lectura. El usuario puede filtrar por período (diario, semanal, mensual o rango personalizado), categoría de producto y bodega antes de descargar.

**Alternativas descartadas**

- **Solo PDF:** el cliente necesita editar y reutilizar los reportes, no es viable como formato único.
- **Solo CSV:** no soporta formato, múltiples hojas ni estilos; no es comparable al flujo actual del cliente.
- **Reportes solo en pantalla sin descarga:** el cliente necesita compartir información con personas externas al sistema.
- **SheetJS (xlsx) en lugar de ExcelJS:** alternativa válida; se prefirió ExcelJS por su API más expresiva para estilos y mejor soporte mantenido para Node.js.

**Consecuencias**

*Positivas:* El cliente puede continuar su flujo de trabajo habitual sin cambiar procesos. Los reportes son auditables y archivables fuera del sistema. Excel es el formato de facto en el contexto operativo, lo que facilita la adopción.

*Negativas:* Archivos generados programáticamente pueden tener diferencias menores de formato con versiones antiguas de Excel o LibreOffice Calc. Períodos largos con muchos movimientos pueden generar archivos pesados. Mantener dos formatos (XLSX y PDF) implica doble código a probar.

---

### ADR-006 — Next.js full-stack en lugar de backend separado

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

ADR-001 establece una arquitectura en capas con separación clara entre presentación, aplicación, dominio e infraestructura. Una lectura tradicional de "API REST" sugiere dos repositorios: uno para frontend (React) y otro para backend (Express, Django, Spring Boot). El equipo evaluó si esa separación física aporta valor real a un proyecto del alcance y plazo del SGIL.

**Decisión**

Se utiliza **Next.js 15 con App Router** como framework full-stack en un único repositorio. La separación entre capas se mantiene a nivel de carpetas y convenciones, no a nivel de proyectos:

- **Cliente (frontend):** Client Components con `"use client"`.
- **Servidor (backend):** Server Components, Route Handlers (`app/api/`) y Server Actions.
- **Dominio:** módulos en `lib/domain/` importables desde cualquier capa servidor.
- **Datos:** repositorios en `lib/repositories/` que encapsulan el acceso a Supabase.

Los tipos generados desde el esquema de Supabase (`lib/supabase/database.types.ts`) se comparten entre cliente y servidor sin duplicación.

**Alternativas descartadas**

- **Backend separado (Express/Fastify):** duplica configuración (CORS, dos pipelines, dos despliegues, dos `package.json`), duplica tipos entre cliente y servidor, no aporta valor para un equipo pequeño con plazos cortos.
- **Backend separado en otro lenguaje (Django, Spring Boot, Rust + Axum):** suma curva de aprendizaje y costo de coordinación entre dos stacks. Considerado en una versión anterior del proyecto y descartado al verificar que Next.js cubre todos los requisitos.
- **Remix:** alternativa válida con filosofía similar. Se prefirió Next.js por madurez del ecosistema, integración nativa con Vercel y mayor base de documentación.

**Consecuencias**

*Positivas:* Un único proyecto, un único despliegue, tipos compartidos sin duplicación. Vercel maneja el despliegue automáticamente desde GitHub. Server Components reducen el bundle JavaScript del cliente. Server Actions simplifican mutaciones sin escribir endpoints manualmente.

*Negativas:* Si en el futuro se requiere un cliente móvil nativo, los Server Actions no se pueden consumir desde fuera de Next.js — habría que exponer Route Handlers como API REST formal (factible, pero requiere trabajo adicional). El equipo debe mantener disciplina para no mezclar lógica de cliente y servidor: Next.js no siempre falla en compilación cuando se cruzan capas.

---

### ADR-007 — Supabase como Backend-as-a-Service

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

El proyecto requiere una base de datos relacional, autenticación, autorización por rol, comunicación en tiempo real (para alertas y cambios de stock) y un mecanismo de despliegue simple. Implementar todo eso desde cero consumiría una porción significativa del tiempo de los tres cortes, dejando menos margen para la lógica de dominio que es el verdadero valor del sistema.

**Decisión**

Se utiliza **Supabase** como plataforma backend integrada que entrega:

- **PostgreSQL 16 gestionado** con migraciones versionadas y tipos TypeScript autogenerados (ver ADR-002).
- **Supabase Auth** para autenticación con JWT y manejo de sesiones (ver ADR-003).
- **Row Level Security** como segunda capa de autorización a nivel de BD (ver ADR-008).
- **Supabase Realtime** para suscripciones a cambios en tablas vía WebSocket (ver ADR-009).
- **Supabase Storage** para guardar reportes generados que se quieran persistir.

Esto permite que el código propio del equipo se concentre en la lógica de dominio (FEFO, alertas, indicadores) y la presentación, no en infraestructura.

**Alternativas descartadas**

- **Stack manual (Node.js + Express + Passport.js + PostgreSQL + Socket.io):** se descartó porque exige implementar y mantener manualmente lo que Supabase entrega gestionado. Para un proyecto de 10 semanas, multiplica el riesgo de bugs en componentes no diferenciadores.
- **Firebase:** se descartó por su modelo NoSQL (Firestore), incompatible con el dominio relacional del SGIL (ver ADR-002).
- **AWS Amplify:** alternativa funcional pero con mayor complejidad de configuración inicial y curva de aprendizaje más pronunciada para el equipo.
- **Pocketbase:** alternativa interesante (SQLite + auth + realtime en un binario), descartada porque no es PostgreSQL y limita el rendimiento bajo concurrencia.

**Consecuencias**

*Positivas:* Reduce drásticamente el tiempo dedicado a infraestructura. Plan gratuito suficiente para un MVP académico. Migración futura factible: la BD es Postgres estándar; auth y realtime tendrían que reimplementarse, pero son funcionalidades acotadas.

*Negativas:* Dependencia de un proveedor externo. Algunas funcionalidades específicas (RLS, Realtime) están atadas a su implementación. Si Supabase cambia precios o políticas, el equipo debe planificar migración. Mitigación: el esquema y las migraciones están versionados; el código de aplicación está aislado del proveedor mediante repositorios.

---

### ADR-008 — Row Level Security como segunda capa de autorización

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

ADR-003 establece que cada Route Handler valida el rol del JWT antes de procesar mutaciones. Sin embargo, una sola capa de defensa es frágil: un error de programación que omita la validación, una ruta nueva sin guard, o un bug en el middleware podría permitir que un Dueño (solo lectura) ejecutara una operación de escritura. La ERS exige (RF-02) que el control de acceso por rol sea estricto.

**Decisión**

Se aplica **Row Level Security (RLS)** de PostgreSQL como segunda capa de autorización. Cada tabla del esquema tiene RLS habilitado con políticas explícitas que validan el rol del usuario (extraído del JWT mediante `auth.jwt() ->> 'rol'`).

Ejemplo:

```sql
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY productos_select ON productos
  FOR SELECT USING (true);  -- todos los roles pueden leer

CREATE POLICY productos_insert ON productos
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'rol' IN ('encargado', 'jefe_produccion')
  );

CREATE POLICY productos_update ON productos
  FOR UPDATE USING (
    auth.jwt() ->> 'rol' IN ('encargado', 'jefe_produccion')
  );
```

Aunque un atacante saltara los guards del backend, Postgres rechazaría la operación. Esto es **defensa en profundidad**.

**Alternativas descartadas**

- **Solo validación en backend (sin RLS):** una sola capa de defensa. Cualquier error de implementación abre una vulnerabilidad real.
- **RLS sin validación en backend:** posible pero degrada los mensajes de error (el error viene de Postgres como "row violates policy" en lugar de un 403 con mensaje claro). Además, validar antes evita viajes innecesarios a la BD.
- **Aplicar permisos solo en frontend:** explícitamente inseguro; cualquier cliente HTTP podría saltarlo.

**Consecuencias**

*Positivas:* Si una validación de backend se olvida o se introduce un bug, la BD sigue protegiendo los datos. Las políticas RLS son código declarativo, fácil de auditar. Cumple RNF-03 (seguridad) y contribuye al cumplimiento de RNF-08 (protección de datos y confidencialidad) mediante control de acceso multinivel.

*Negativas:* Las políticas RLS se deben mantener sincronizadas con la lógica de roles del backend. Si se agrega un rol nuevo, hay que actualizar políticas en cada tabla. Probar RLS requiere pruebas explícitas por rol (cubierto en estrategia de pruebas). Cliente con `SUPABASE_SERVICE_ROLE_KEY` salta RLS — esa clave solo se usa en código servidor confiable y nunca se expone al navegador.

---

### ADR-009 — Supabase Realtime para actualizaciones en vivo

> **Estado:** Aceptado · **Fecha:** Mayo 2026

**Contexto**

El panel de alertas (RF-16) requiere actualizarse sin recargar la página cuando se generan nuevas alertas de stock mínimo o vencimiento. Igualmente, los cambios de stock deben reflejarse en tiempo real cuando otro operario registra un movimiento. Implementar WebSockets propios (Socket.io, ws, Server-Sent Events) requiere un servidor con estado, incompatible con el modelo serverless de Vercel.

**Decisión**

Se utiliza **Supabase Realtime**, que expone cambios en tablas de Postgres como eventos sobre WebSocket. Los componentes que requieren actualización en vivo se suscriben a los canales correspondientes:

```typescript
const channel = supabase
  .channel('alertas')
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'alertas' },
      (payload) => refetchAlertas())
  .subscribe();
```

La **fuente de verdad sigue siendo Postgres**. Realtime es solo un canal de notificación que dispara la revalidación de los datos en el cliente. No se usa Realtime para enviar lógica de negocio.

**Alternativas descartadas**

- **Polling periódico (cada N segundos):** consume más recursos y produce latencia perceptible. Para alertas operativas críticas, no es adecuado.
- **Servidor WebSocket propio (Socket.io, ws):** incompatible con Vercel serverless. Requiere otro servicio (Render, Fly.io, VPS), aumentando complejidad operativa.
- **Server-Sent Events (SSE):** alternativa válida pero unidireccional y con limitaciones de conexiones concurrentes en serverless. Supabase Realtime es más capaz.

**Consecuencias**

*Positivas:* WebSockets sin servidor propio. Suscripciones declarativas por tabla. Se integra con RLS: un usuario solo recibe eventos sobre filas que su rol puede ver. Cumple RF-14, RF-15 y RF-16 (alertas en tiempo real).

*Negativas:* Si la conexión WebSocket se pierde, los componentes deben manejar reconexión (el SDK de Supabase lo hace, pero es bueno validarlo). El plan gratuito de Supabase tiene límite de conexiones concurrentes (200), suficiente para el alcance (RNF-01: 5 usuarios), pero a considerar si crece.

---

## 3. Resumen de decisiones

| ID | Título | Estado | Decisión clave |
|---|---|---|---|
| ADR-001 | Arquitectura en capas con separación lógica frontend/backend | Aceptado | 4 capas en un solo proyecto Next.js |
| ADR-002 | Supabase (PostgreSQL gestionado) como capa de datos | Aceptado | Postgres + Repository + migraciones versionadas |
| ADR-003 | Autenticación con Supabase Auth (JWT) | Aceptado | JWT + refresh automático + bcrypt gestionado |
| ADR-004 | Política FEFO con patrón Strategy | Aceptado | FEFO por defecto, Strategy permite excepciones |
| ADR-005 | Reportes en Excel (.xlsx) | Aceptado | ExcelJS + jsPDF como alternativa |
| ADR-006 | Next.js full-stack en lugar de backend separado | Aceptado | Monorepo Next.js (no dos proyectos) |
| ADR-007 | Supabase como Backend-as-a-Service | Aceptado | Auth + DB + Realtime + Storage gestionados |
| ADR-008 | Row Level Security como segunda capa de autorización | Aceptado | RLS en Postgres + guards en backend |
| ADR-009 | Supabase Realtime para actualizaciones en vivo | Aceptado | WebSockets sobre cambios de tabla |

---

## 4. Alineación con los requisitos del proyecto

| Módulo / Requisito | ADR relacionado | Fuente del requisito |
|---|---|---|
| Autenticación y roles | ADR-001, ADR-003, ADR-008 | ERS RF-01, RF-02, RF-03 |
| Gestión de inventario con lotes y vencimientos | ADR-002 | ERS RF-04 a RF-09 |
| Recepción de mercancía (con o sin orden previa) | ADR-002 | ERS RF-10, RF-11 + Industrial |
| Picking priorizado y despacho interno | ADR-004 | Mapa de procesos — Industrial |
| Tres bodegas: principal, producción, neveras | ADR-002 | Mapa de procesos — Industrial |
| Reglas de negocio: FEFO, margen mínimo de vencimiento | ADR-004 | Reunión + documento Industrial |
| Alertas en tiempo real | ADR-009 | ERS RF-14, RF-15, RF-16 |
| Dashboard de KPIs y reportes | ADR-005 | ERS RF-17, RF-18 |
| Exportación en Excel | ADR-005 | Reunión con Industrial |
| Despliegue simple y sostenible | ADR-006, ADR-007 | Restricción de alcance académico |
| Despacho al cliente final | — (fuera de alcance) | Confirmado por Industrial |
