# Análisis de Tradeoffs Arquitectónicos

## Sistema de Gestión de Inventario y Logística (SGIL)

**Proyecto Nuclear 3**

- **Institución:** Corporación Universitaria Alexander von Humboldt
- **Programa:** Ingeniería de Software — Semestre I-2026
- **Asignatura:** Arquitectura de Software I — Docente: Santiago Jaramillo L.
- **Ubicación:** Armenia, Quindío
- **Fecha:** Mayo 2026

---

## 1. Introducción

Toda decisión arquitectónica tiene un costo: ganar en un atributo de calidad casi siempre significa perder en otro. Un *tradeoff* es ese costo hecho explícito. Este documento revisa los **nueve ADRs aprobados** para el SGIL y, para cada uno, describe qué se gana y qué se sacrifica.

El objetivo es dejar evidencia de que las decisiones se tomaron entendiendo sus consecuencias, y tener una referencia clara para revisar un ADR más adelante si el atributo sacrificado se vuelve un problema.

El documento se organiza así: primero se priorizan los atributos de calidad relevantes para el SGIL, después se analiza el tradeoff de cada ADR, y al final se incluye una tabla resumen y las conclusiones.

---

## 2. Atributos de calidad priorizados

Los siguientes atributos son los más importantes para el SGIL según los requisitos no funcionales (RNF-01 a RNF-08) y el contexto del cliente:

- **Mantenibilidad:** el proyecto se entrega en tres cortes y la asignatura de Pruebas de Software exige cobertura de 70% (RNF-06).
- **Integridad de datos:** un descuento incorrecto de stock daña la operación real del centro de distribución.
- **Seguridad:** aplica la Ley 1581 de 2012 de protección de datos (RNF-08) y existen tres roles con permisos distintos (RF-02).
- **Usabilidad:** los usuarios no son técnicos y deben poder operar el sistema sin capacitación formal (RNF-04).
- **Velocidad de entrega:** plazo académico fijo de aproximadamente 10 semanas distribuidas en tres cortes.

Los atributos de prioridad media (rendimiento, escalabilidad, disponibilidad) son importantes pero no críticos: el sistema solo soporta 5 usuarios simultáneos en horario operativo (8 a.m. a 6 p.m.), por lo que no se requieren soluciones de alta disponibilidad.

---

## 3. Tradeoffs por decisión

### 3.1 ADR-001 — Arquitectura en capas con separación lógica frontend/backend

**Decisión:** cuatro capas (presentación, aplicación, dominio, infraestructura) implementadas como separación lógica dentro de un único proyecto Next.js, no como dos repositorios separados.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Mantenibilidad** | Cada capa evoluciona de forma independiente. La lógica de dominio queda aislada y reusable. | La separación lógica depende de disciplina del equipo; el compilador no impide cruzar capas. |
| **Testabilidad** | La lógica de dominio es testeable sin levantar UI ni base de datos. | Las pruebas E2E con Playwright requieren orquestar Supabase local + Next.js dev. |
| **Velocidad de entrega** | Un único repositorio, un único despliegue, sin coordinar versiones cliente/servidor. | El equipo debe aprender la distinción Server vs Client Components de Next.js. |
| **Acoplamiento** | El dominio no depende de la infraestructura: se puede mockear Supabase en pruebas. | Si la convención de capas se rompe (lógica de negocio en componentes), el costo de refactor crece rápido. |

**Conclusión:** se sacrifica rigidez estructural (no hay un compilador que prohíba cruzar capas) a cambio de mantenibilidad y velocidad de entrega. Para un equipo pequeño con plazos académicos cortos, la separación lógica es suficiente si se respeta la convención documentada en `CLAUDE.md`.

---

### 3.2 ADR-002 — Supabase (PostgreSQL gestionado) como capa de datos

**Decisión:** PostgreSQL 16 administrado por Supabase, accedido mediante cliente tipado y patrón Repository. Tres bodegas modeladas como entidad (`principal`, `produccion`, `neveras`).

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Integridad de datos** | Claves foráneas y transacciones ACID garantizan que un despacho descuente el stock correcto. | El esquema rígido impide guardar datos parcialmente consistentes durante prototipado rápido. |
| **Consistencia** | El modelo refleja directamente el dominio: producto, lote, bodega, movimiento, orden. | Si una regla cambia (ej. un producto con varios códigos), la migración puede afectar varias tablas. |
| **Tipado** | Tipos TypeScript autogenerados desde el esquema reducen errores en compilación. | Cada cambio de esquema requiere regenerar tipos (`pnpm db:types`) y revisar diffs. |
| **Rendimiento de reportes** | Los KPIs requieren JOINs entre tablas; SQL es óptimo para esto. | Al crecer el histórico de movimientos, los reportes amplios pueden requerir índices o vistas materializadas. |
| **Independencia del proveedor** | El esquema es PostgreSQL estándar y portable. | Funcionalidades como Realtime y RLS están atadas a Supabase; migrar implica reimplementarlas. |

**Conclusión:** se sacrifica flexibilidad de esquema y cierta dependencia de proveedor a cambio de integridad referencial e infraestructura gestionada. La corrección del inventario no es negociable en este dominio, así que el sacrificio se justifica plenamente.

---

### 3.3 ADR-003 — Autenticación con Supabase Auth (JWT)

**Decisión:** Supabase Auth emite y valida JWT con refresh token automático gestionado por `@supabase/ssr`. Access token de 1 hora, sesión efectiva alineada con la jornada de 8 horas.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Seguridad** | bcrypt, hashing seguro, rotación de tokens, cookies httpOnly — todo gestionado y probado por Supabase. | Dependencia de la postura de seguridad del proveedor; el equipo no controla detalles internos de la implementación. |
| **Velocidad de entrega** | No se escribe código propio de login, hashing, refresh ni recuperación de contraseña. | Personalizar el flujo (ej. agregar 2FA) requiere conocer la API de Supabase, no implementarlo libremente. |
| **Experiencia de usuario** | Refresh automático evita re-login a mitad de jornada. | Si Supabase tiene caída de Auth, el sistema completo queda inaccesible. |
| **Revocación de sesiones** | Posible vía `supabase.auth.admin.signOut(userId)`. | El rol cacheado en JWT no se actualiza hasta el siguiente refresh (≤ 1 h). Cambio de rol en BD no es inmediato. |

**Conclusión:** se sacrifica control fino sobre el flujo de auth a cambio de eliminar superficie de error y acelerar la entrega. Para un MVP académico con cumplimiento de RNF-03 (seguridad), el balance es ampliamente favorable.

---

### 3.4 ADR-004 — Política FEFO con patrón Strategy

**Decisión:** al registrar un despacho, el sistema selecciona automáticamente el lote con fecha de vencimiento más próxima. La lógica se encapsula en una Strategy en `lib/domain/politicas-despacho/`, permitiendo agregar variantes (FIFO, picking urgente, selección manual) sin tocar el módulo de despacho.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Reducción de pérdidas** | El cliente pierde menos producto por vencimiento; es el beneficio directo del sistema. | Solo funciona si todos los lotes tienen la fecha de vencimiento registrada correctamente. |
| **Extensibilidad** | Se pueden agregar políticas alternativas (picking urgente, FIFO específico) sin tocar despacho. Cumple Open/Closed. | El equipo debe entender el patrón Strategy desde el inicio; puede parecer sobreingeniería para un solo caso. |
| **Testabilidad** | Cada política es una función pura, fácil de cubrir con pruebas unitarias sin BD. | Los casos de prueba se multiplican: hay que validar cada política y cada combinación con el módulo de despacho. |
| **Usabilidad** | El operario no decide manualmente qué lote despachar, lo que reduce errores humanos. | Si la fecha en sistema no coincide con la realidad física, el operario despacha el lote incorrecto sin saberlo. |
| **Casos excepcionales** | La política `PoliticaManual` permite cubrir casos de picking urgente o fecha especial. | Cada excepción manual requiere justificación registrada, lo que agrega fricción al flujo. |

**Conclusión:** se sacrifica control manual del operario y cierta complejidad inicial a cambio de menos pérdidas y un módulo extensible. La decisión es correcta porque ataca el problema central del cliente: los productos perecederos. Requiere disciplina al capturar fechas en la recepción.

---

### 3.5 ADR-005 — Reportes en Excel (.xlsx) y PDF

**Decisión:** reportes en `.xlsx` con ExcelJS desde un Route Handler de Next.js (runtime Node), y opcionalmente en PDF con jsPDF. Filtrables por período, categoría y bodega.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Adopción del cliente** | El cliente ya trabaja con Excel; no cambia su flujo de trabajo y baja la curva de adopción. | Se refuerza la dependencia del cliente con Excel y se posterga la madurez digital del centro. |
| **Usabilidad** | Dueños y Jefe de Producción pueden seguir filtrando y compartiendo por correo como hacen hoy. | Las gráficas interactivas del dashboard se quedan en pantalla; el archivo descargado es estático. |
| **Mantenibilidad** | ExcelJS y jsPDF son librerías maduras y bien documentadas. | Mantener dos formatos (XLSX y PDF) duplica el código de generación, plantillas y pruebas. |
| **Rendimiento** | Para volúmenes pequeños la generación es instantánea. | Si se filtran rangos amplios (anual) el archivo puede pesar varios MB y demorar en generarse. |
| **Runtime** | Node runtime soporta todas las APIs de ExcelJS sin restricciones. | No se puede usar Edge runtime; aumenta levemente el tiempo de cold start en Vercel. |

**Conclusión:** se sacrifica esfuerzo de desarrollo a cambio de adopción del cliente. Para un MVP cuyo éxito depende de que el cliente efectivamente use el sistema, ir al encuentro del cliente es la decisión correcta.

---

### 3.6 ADR-006 — Next.js full-stack en lugar de backend separado

**Decisión:** un único proyecto Next.js 15 con App Router que contiene cliente, Server Components, Route Handlers y Server Actions. Sin segundo repositorio para backend.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Velocidad de entrega** | Un único proyecto, un único despliegue, un único `package.json`. Cero configuración de CORS. | Si en el futuro se requiere cliente móvil nativo, las Server Actions no se consumen desde fuera. |
| **Mantenibilidad** | Tipos compartidos entre cliente y servidor sin duplicación. Refactors atómicos. | El equipo debe distinguir Server vs Client Components — confusión inicial común. |
| **Despliegue** | Vercel maneja todo el ciclo desde GitHub: build, preview, producción. | Lock-in implícito con Vercel para hosting (mitigable: Next.js corre en Node estándar). |
| **Independencia de capas** | La capa de aplicación está separada por carpetas, no por proyectos. | Es más fácil violar la separación si no se respeta la convención (`lib/domain/` puro). |

**Conclusión:** se sacrifica la opción de tener un cliente móvil nativo en el corto plazo a cambio de drástica reducción del costo operativo y mejor velocidad de entrega. Para el alcance del MVP (PC de escritorio según RNF-05), el sacrificio es virtual.

---

### 3.7 ADR-007 — Supabase como Backend-as-a-Service

**Decisión:** uso de Supabase como plataforma integrada que provee Postgres, Auth, Realtime y Storage, en lugar de ensamblar componentes individuales.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Velocidad de entrega** | Auth + DB + Realtime + Storage en una sola plataforma con plan gratuito generoso. | Aprender la API y convenciones de Supabase es una curva inicial. |
| **Mantenibilidad** | Menos código propio = menos bugs = menos pruebas que escribir. | Algunas funcionalidades específicas (RLS, Realtime) son particulares de Supabase. |
| **Costo operativo** | Plan gratuito cubre el MVP. No hay servidores que mantener. | Crecer más allá del plan gratuito implica costo recurrente. |
| **Independencia del proveedor** | El esquema PostgreSQL es portable. | Reimplementar Auth, Realtime y RLS en una migración no es trivial. |
| **Soporte** | Documentación oficial, Discord activo, ejemplos abundantes. | Si Supabase tiene una incidencia, el equipo no puede resolverla por sí mismo. |

**Conclusión:** se sacrifica autonomía total a cambio de un acelerador masivo de desarrollo. Para un proyecto de 10 semanas, el equipo no podría implementar manualmente Auth + Realtime + Postgres gestionado con la misma calidad.

---

### 3.8 ADR-008 — Row Level Security como segunda capa de autorización

**Decisión:** RLS habilitado en todas las tablas con políticas que validan el rol del usuario extraído del JWT. Defensa en profundidad: backend valida primero, BD valida después.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Seguridad** | Si una validación de backend se omite o tiene bug, la BD sigue protegiendo los datos. | Las políticas RLS deben mantenerse sincronizadas con la lógica de roles del backend. |
| **Auditabilidad** | Las políticas son SQL declarativo, fáciles de revisar. | Hay que documentar cada política y probarla con pruebas explícitas por rol. |
| **Defensa en profundidad** | Cumple RNF-03 robustamente: dos capas independientes. | Si se agrega un rol nuevo, hay que actualizar políticas en cada tabla afectada. |
| **Rendimiento** | RLS se evalúa en planes de consulta optimizados por Postgres. | Una política mal escrita puede degradar el rendimiento de consultas grandes. |
| **Mensajes de error** | Backend valida primero y devuelve 403 con mensaje claro. | Sin esa validación previa, los errores de RLS aparecen como "row violates policy" — confusos para el usuario. |

**Conclusión:** se sacrifica mantenimiento adicional (políticas en cada tabla) a cambio de defensa en profundidad. Para un sistema bajo Ley 1581 con tres roles diferenciados, el costo es plenamente justificado.

---

### 3.9 ADR-009 — Supabase Realtime para actualizaciones en vivo

**Decisión:** suscripciones WebSocket a cambios en tablas de Postgres mediante Supabase Realtime, en lugar de implementar un servidor WebSocket propio.

| Atributo | Lo que se gana | Lo que se sacrifica |
|---|---|---|
| **Velocidad de entrega** | WebSockets funcionales sin escribir código de servidor. Compatible con Vercel serverless. | El equipo debe aprender el modelo de canales y eventos de Supabase. |
| **Compatibilidad con RLS** | Las suscripciones respetan RLS: un Dueño solo recibe eventos sobre filas que puede ver. | Si una política RLS está mal, la suscripción también filtra mal — bug compuesto. |
| **Costo operativo** | Plan gratuito incluye 200 conexiones concurrentes, suficiente para 5 usuarios (RNF-01). | Crecer más allá implica plan pago o cambiar de proveedor. |
| **UX** | Alertas y stock se actualizan sin recargar página (RF-14, RF-15, RF-16). | Si la conexión WebSocket se pierde temporalmente, el panel puede quedar desactualizado hasta reconectar. |
| **Simplicidad de modelo** | La BD es la fuente de verdad; Realtime solo notifica. No hay lógica duplicada. | El cliente debe re-consultar tras recibir notificación; no usar el payload del evento como fuente de datos. |

**Conclusión:** se sacrifica autonomía de la capa realtime a cambio de no mantener un servidor WebSocket propio. Para un equipo sin experiencia previa en infraestructura distribuida (contexto declarado en ADR-001), el sacrificio es claramente favorable.

---

## 4. Resumen consolidado

| ADR | Decisión | Se prioriza | Se sacrifica |
|---|---|---|---|
| **ADR-001** | Arquitectura en capas con separación lógica frontend/backend | Mantenibilidad y testabilidad | Rigidez estructural (capas no enforced por compilador) |
| **ADR-002** | Supabase (PostgreSQL gestionado) como capa de datos | Integridad y consistencia | Flexibilidad de esquema y dependencia de proveedor |
| **ADR-003** | Autenticación con Supabase Auth (JWT) | Seguridad y velocidad de entrega | Control fino sobre el flujo de auth |
| **ADR-004** | Política FEFO con patrón Strategy | Reducción de pérdidas y extensibilidad | Dependencia del dato de vencimiento |
| **ADR-005** | Reportes en Excel y PDF | Adopción del cliente | Esfuerzo de mantenimiento doble |
| **ADR-006** | Next.js full-stack en lugar de backend separado | Velocidad de entrega y simplicidad | Posibilidad inmediata de cliente móvil nativo |
| **ADR-007** | Supabase como Backend-as-a-Service | Velocidad de entrega y bajo costo operativo | Autonomía total de la infraestructura |
| **ADR-008** | Row Level Security como segunda capa de autorización | Seguridad (defensa en profundidad) | Mantenimiento de políticas por tabla |
| **ADR-009** | Supabase Realtime para actualizaciones en vivo | UX y simplicidad operativa | Dependencia del proveedor para realtime |

---

## 5. Conclusiones

Las decisiones del SGIL siguen un patrón coherente: se prioriza **mantenibilidad, integridad de datos, seguridad y velocidad de entrega**, a costa de **autonomía total del stack, flexibilidad de esquema y esfuerzo de mantenimiento**. Este patrón es consistente con el contexto del proyecto: un MVP académico de diez semanas, evaluado por dos asignaturas, entregado a un cliente real con un equipo sin experiencia previa en infraestructura distribuida.

Los tradeoffs aceptados no son problemas; son decisiones tomadas a conciencia. Sin embargo, los siguientes puntos deben monitorearse durante la operación:

- **ADR-002:** planificar índices o vistas materializadas al superar varios miles de movimientos en historial.
- **ADR-003:** monitorear consumo de Supabase Auth si el número de usuarios crece más allá del plan gratuito.
- **ADR-004:** auditar que todos los lotes tengan fecha de vencimiento registrada correctamente.
- **ADR-005:** dividir la exportación por trimestres si los reportes anuales superan 10 MB.
- **ADR-007:** evaluar costo del plan pago de Supabase si el sistema pasa de MVP académico a operación real.
- **ADR-008:** revisar políticas RLS en cada migración que toque permisos o agregue roles.
- **ADR-009:** evaluar reconexión manual si se reportan desincronizaciones del panel de alertas.

Si alguno de estos puntos se vuelve crítico, el ADR correspondiente debe revisarse y, en caso de cambio, marcarse como `[Reemplazado]` con un nuevo ADR que documente la nueva decisión.

---

## 6. Referencias

- Bass, L., Clements, P. y Kazman, R. (2021). *Software Architecture in Practice* (4.ª ed.). Addison-Wesley.
- ISO/IEC 25010:2011. *Systems and software Quality Requirements and Evaluation (SQuaRE)*.
- Especificación de Requisitos de Software (ERS) — SGIL. Proyecto Nuclear 3. Mayo 2026.
- Architecture Decision Records (ADR) — SGIL. Proyecto Nuclear 3. Mayo 2026.
- Documento técnico del SGIL — Proyecto Nuclear 3. Mayo 2026.
