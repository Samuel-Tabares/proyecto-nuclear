# Especificación de Requisitos de Software (ERS)

## Sistema de Gestión de Inventario y Logística (SGIL) para Centros de Distribución

**Proyecto Nuclear 3 — Primer Corte**

- **Institución:** Corporación Universitaria Alexander von Humboldt
- **Programa:** Ingeniería de Software — Semestre I-2026
- **Asignatura:** Arquitectura de Software I — Docente: Santiago Jaramillo L.
- **Asignatura:** Pruebas de Software — Docente: Jose Alfredo Ramirez
- **Ubicación:** Armenia, Quindío
- **Fecha:** Mayo 2026

---

## 1. Introducción

### 1.1 Propósito

El presente documento es la Especificación de Requisitos de Software (ERS) del Sistema de Gestión de Inventario y Logística (SGIL) para centros de distribución. Define de manera formal y completa los requisitos funcionales y no funcionales que el sistema debe satisfacer, sirviendo como contrato entre el equipo de Ingeniería de Software y los clientes funcionales del proyecto (estudiantes de Ingeniería Industrial).

### 1.2 Alcance

El SGIL es una aplicación web que centraliza y automatiza los procesos de gestión de inventario, recepción de mercancía, despacho interno y generación de indicadores operativos para un centro de distribución de productos de pastelería en la región del Quindío. El sistema reemplaza los procesos manuales y en papel actualmente en uso.

**El sistema NO incluye:** gestión del punto de venta, despacho a clientes externos, nómina ni contabilidad.

### 1.3 Stakeholders y Roles del Sistema

| Rol | Descripción | Permisos |
|---|---|---|
| Administrador del sistema | Gestiona usuarios, configura el sistema y supervisa el acceso. Tiene visibilidad total del sistema. | Acceso total: gestión de usuarios (crear, activar, desactivar, asignar rol), todas las operaciones, dashboard KPI y exportación de reportes. |
| Jefe de almacén | Supervisa todas las operaciones del centro de distribución. Aprueba despachos y tiene acceso operativo completo. | Acceso total operativo: crear/editar productos, configurar puntos de reorden, registrar recepciones, aprobar despachos, consultar inventario/lotes, dashboard KPI y exportación de reportes. |
| Operador de recepción | Registra la entrada de mercancía al centro de distribución y gestiona los lotes recibidos. | Crear/consultar órdenes de recepción, registrar lotes, consultar inventario y lotes. No puede aprobar despachos, editar productos ni acceder al dashboard KPI. |
| Operador de despacho | Registra las salidas de mercancía de la bodega hacia producción u otras áreas internas. | Crear/consultar despachos (pendientes de aprobación), consultar inventario y lotes. No puede aprobar sus propios despachos, editar productos ni acceder al dashboard KPI. |

### 1.4 Definiciones y Abreviaturas

- **SGIL:** Sistema de Gestión de Inventario y Logística
- **ERS:** Especificación de Requisitos de Software
- **RF:** Requisito Funcional
- **RNF:** Requisito No Funcional
- **FEFO:** First Expired, First Out — política de despacho por fecha de vencimiento más próxima
- **KPI:** Key Performance Indicator — indicador clave de desempeño
- **MVP:** Minimum Viable Product — producto mínimo viable
- **JWT:** JSON Web Token — mecanismo de autenticación stateless

---

## 2. Requisitos Funcionales

Los requisitos funcionales se organizan por módulo del sistema. Cada requisito incluye identificador, nombre, descripción, actores involucrados, prioridad (Alta / Media / Baja), entradas, salidas esperadas y reglas de negocio asociadas.

### 2.1 Módulo de Autenticación y Control de Acceso

#### RF-01 — Inicio de sesión

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir a los usuarios autenticarse mediante correo electrónico y contraseña. Al autenticarse, el sistema genera un token JWT que identifica al usuario y su rol en cada petición subsecuente. |
| **Actores** | Administrador del sistema, Jefe de almacén, Operador de recepción, Operador de despacho |
| **Prioridad** | Alta |
| **Entradas** | Correo electrónico registrado, contraseña. |
| **Salidas** | Token JWT válido, redirección al dashboard según rol. Mensaje de error si las credenciales son incorrectas. |
| **Reglas de negocio** | La contraseña debe almacenarse como hash (bcrypt). El refresh token expira en 8 horas. Un usuario inactivo no puede iniciar sesión. |

#### RF-02 — Control de acceso por rol

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe restringir el acceso a funcionalidades según el rol del usuario autenticado. Cada rol tiene un conjunto definido de operaciones permitidas según la tabla de stakeholders (sección 1.3). |
| **Actores** | Todos los roles |
| **Prioridad** | Alta |
| **Entradas** | Token JWT con rol del usuario en cada petición. |
| **Salidas** | Acceso concedido o denegado (HTTP 403) con mensaje claro al usuario. |
| **Reglas de negocio** | Cada endpoint del backend debe validar el rol. Un operador que intente realizar una operación fuera de su alcance recibe error 403. El frontend no muestra controles de acción para los que el rol no tiene permiso. |

#### RF-03 — Cierre de sesión

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir al usuario cerrar su sesión de forma explícita, invalidando el token en el cliente. |
| **Actores** | Todos los roles |
| **Prioridad** | Media |
| **Entradas** | Solicitud de cierre de sesión del usuario. |
| **Salidas** | Token eliminado del cliente. Redirección a la pantalla de login. |
| **Reglas de negocio** | El token se elimina del almacenamiento del navegador. El servidor no necesita invalidarlo (stateless), pero el cliente no lo enviará más. |

#### RF-00 — Gestión de usuarios

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir al Administrador del sistema crear, activar, desactivar y asignar rol a los usuarios del SGIL. |
| **Actores** | Administrador del sistema |
| **Prioridad** | Alta |
| **Entradas** | Nombre, correo electrónico, rol asignado, estado activo/inactivo. |
| **Salidas** | Usuario creado o actualizado. Confirmación de la operación. |
| **Reglas de negocio** | Solo el Administrador del sistema puede gestionar usuarios. Un usuario desactivado no puede iniciar sesión (RF-01). El Administrador no puede desactivarse a sí mismo. |

### 2.2 Módulo de Gestión de Inventario

#### RF-04 — Registro de producto

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir registrar nuevos productos en el catálogo, especificando todos sus atributos obligatorios. |
| **Actores** | Administrador del sistema, Jefe de almacén |
| **Prioridad** | Alta |
| **Entradas** | Nombre, código, categoría (tortas caseras / galletería y bizcocho / postres), peso, ingredientes, etiqueta. |
| **Salidas** | Producto registrado y visible en el catálogo. Mensaje de confirmación. |
| **Reglas de negocio** | El código de producto debe ser único. Todos los campos son obligatorios. No se registra proveedor. |

#### RF-05 — Consulta y búsqueda de productos

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir consultar el catálogo de productos con filtros por categoría, nombre y código, mostrando el stock actual por lote. |
| **Actores** | Todos los roles |
| **Prioridad** | Alta |
| **Entradas** | Filtros opcionales: categoría, nombre, código. |
| **Salidas** | Lista de productos con: nombre, código, categoría, stock total actual, estado de alertas. |
| **Reglas de negocio** | El stock mostrado es la suma de las cantidades actuales de todos los lotes activos del producto. Los productos sin stock se muestran con indicador visual diferenciado. |

#### RF-06 — Edición y baja de producto

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir modificar los atributos de un producto existente y darlo de baja (inactivarlo) cuando ya no se gestiona en el centro de distribución. |
| **Actores** | Administrador del sistema, Jefe de almacén |
| **Prioridad** | Media |
| **Entradas** | ID del producto, campos a modificar o acción de baja con motivo. |
| **Salidas** | Producto actualizado o marcado como inactivo. Registro de la modificación con fecha y usuario. |
| **Reglas de negocio** | El código del producto no puede modificarse una vez creado. La baja es lógica (soft delete): el producto queda inactivo y no aparece en búsquedas ni puede recibir nuevos lotes, pero su historial de movimientos se conserva. Un producto con lotes activos con stock mayor a cero no puede darse de baja hasta que el stock sea cero. Cualquier cambio queda registrado con fecha, hora y usuario. |

#### RF-07 — Configuración de punto de reorden

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir definir para cada producto la cantidad mínima de stock que dispara una alerta automática de reposición. |
| **Actores** | Administrador del sistema, Jefe de almacén |
| **Prioridad** | Alta |
| **Entradas** | ID del producto, cantidad mínima (punto de reorden). |
| **Salidas** | Punto de reorden guardado. El sistema genera alerta si el stock actual es menor o igual a este valor. |
| **Reglas de negocio** | El punto de reorden debe ser un número entero mayor a cero. Si no se define, el sistema no genera alertas de stock mínimo para ese producto. |

### 2.3 Módulo de Gestión de Lotes

#### RF-08 — Registro de lote

| Campo | Contenido |
|---|---|
| **Descripción** | Al recibir mercancía, el sistema debe crear un lote asociado al producto con su información de trazabilidad completa. |
| **Actores** | Administrador del sistema, Jefe de almacén, Operador de recepción |
| **Prioridad** | Alta |
| **Entradas** | Producto, número de lote, fecha de vencimiento, fecha de recepción, cantidad recibida, ubicación en bodega (principal / producción / neveras). |
| **Salidas** | Lote creado y vinculado al producto. Stock del producto actualizado. Movimiento de entrada registrado. |
| **Reglas de negocio** | La fecha de vencimiento debe ser posterior a la fecha de recepción más el límite mínimo definido para ese producto (ej: harina mínimo 3 meses). Si no cumple, el sistema muestra advertencia y solicita confirmación. |

#### RF-09 — Consulta de lotes por producto

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe mostrar todos los lotes activos de un producto con su cantidad actual, fecha de vencimiento y ubicación. |
| **Actores** | Todos los roles |
| **Prioridad** | Alta |
| **Entradas** | ID del producto. |
| **Salidas** | Lista de lotes ordenada por fecha de vencimiento (FEFO): número de lote, fecha vencimiento, cantidad actual, ubicación, estado (vigente / próximo a vencer / vencido). |
| **Reglas de negocio** | Un lote se considera próximo a vencer cuando quedan 30 días o menos para su fecha de vencimiento. Un lote con cantidad 0 se marca como agotado. |

### 2.4 Módulo de Recepción de Mercancía

#### RF-10 — Registro de orden de recepción

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir registrar la llegada de mercancía al centro de distribución, vinculando opcionalmente una orden de compra con la factura del proveedor y los lotes recibidos. Se puede recibir mercancía sin orden de compra previa. |
| **Actores** | Administrador del sistema, Jefe de almacén, Operador de recepción |
| **Prioridad** | Alta |
| **Entradas** | Número de factura, fecha de recepción, lista de productos/lotes recibidos con cantidades. Número de orden de compra (opcional). |
| **Salidas** | Orden de recepción registrada. Lotes creados automáticamente. Stock actualizado. Movimientos de entrada generados. |
| **Reglas de negocio** | Una orden de recepción debe tener al menos un producto. La validación de fecha de vencimiento (RF-08) aplica para cada lote registrado. El número de factura debe ser único por orden. La orden de compra es opcional. |

#### RF-11 — Consulta de órdenes de recepción

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir consultar el historial de órdenes de recepción con filtros por fecha y estado. |
| **Actores** | Todos los roles |
| **Prioridad** | Media |
| **Entradas** | Filtros opcionales: rango de fechas, estado (pendiente / recibida). |
| **Salidas** | Lista de órdenes con: número de orden, número de factura, fecha, estado, total de productos recibidos. |
| **Reglas de negocio** | Los operadores de despacho solo pueden consultar recepciones, no crearlas. |

### 2.5 Módulo de Despacho Interno

#### RF-12 — Registro y aprobación de despacho

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir registrar despachos internos de productos desde el inventario hacia producción u otras áreas internas, con aprobación del Jefe de almacén. |
| **Actores** | Registro: Administrador del sistema, Jefe de almacén, Operador de despacho. Aprobación: Administrador del sistema, Jefe de almacén. |
| **Prioridad** | Alta |
| **Entradas** | Lista de productos a despachar con cantidades, destino interno, fecha. |
| **Salidas** | Despacho registrado (estado: pendiente). Al aprobar: stock descontado automáticamente por lote siguiendo la política FEFO. Movimientos de salida generados. |
| **Reglas de negocio** | El Operador de despacho crea el despacho en estado pendiente. Solo el Jefe de almacén o el Administrador del sistema pueden aprobarlo. El sistema descuenta automáticamente del lote con fecha de vencimiento más próxima (FEFO). Si el stock disponible es insuficiente, el sistema muestra advertencia y no permite el despacho. Un operador no puede aprobar su propio despacho. |

#### RF-13 — Consulta de despachos

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir consultar el historial de despachos internos con filtros por fecha y estado. |
| **Actores** | Todos los roles |
| **Prioridad** | Media |
| **Entradas** | Filtros opcionales: rango de fechas, estado (pendiente / aprobado / despachado). |
| **Salidas** | Lista de despachos con: fecha, destino, estado, total de unidades despachadas. |
| **Reglas de negocio** | Los operadores de recepción solo pueden consultar despachos, no crearlos. El despacho al punto de venta (clientes externos) está fuera del alcance del sistema. |

### 2.6 Módulo de Alertas Operativas

#### RF-14 — Alertas de stock mínimo

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe generar automáticamente una alerta cuando el stock de un producto cae por debajo o igual a su punto de reorden configurado. |
| **Actores** | Sistema (automático) |
| **Prioridad** | Alta |
| **Entradas** | Stock actual del producto, punto de reorden configurado. |
| **Salidas** | Alerta visible en el panel de alertas con: nombre del producto, stock actual, punto de reorden. Indicador visual en la lista de productos. |
| **Reglas de negocio** | La alerta se genera en tiempo real al registrar cualquier movimiento de salida. Solo se genera una alerta activa por producto a la vez. La alerta se desactiva cuando el stock supera el punto de reorden. |

#### RF-15 — Alertas de vencimiento próximo

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe generar alertas para los lotes cuya fecha de vencimiento esté a 30 días o menos. |
| **Actores** | Sistema (automático) |
| **Prioridad** | Alta |
| **Entradas** | Fecha de vencimiento de cada lote, fecha actual del sistema. |
| **Salidas** | Alerta en el panel con: producto, número de lote, fecha de vencimiento, días restantes, cantidad en lote. |
| **Reglas de negocio** | El cálculo se realiza al cargar el dashboard y al registrar movimientos. Los lotes ya vencidos se muestran con indicador de color diferente (crítico). |

#### RF-16 — Panel de alertas operativas

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe mostrar un panel centralizado con todas las alertas activas del sistema, accesible desde el dashboard principal, con actualización en tiempo real. |
| **Actores** | Todos los roles |
| **Prioridad** | Alta |
| **Entradas** | Alertas activas en el sistema. |
| **Salidas** | Panel con alertas agrupadas por tipo: stock mínimo, próximos a vencer, vencidos, pedidos pendientes de aprobación de despacho. Cada alerta muestra su severidad (advertencia / crítico). |
| **Reglas de negocio** | Las alertas se ordenan por severidad (crítico primero). El panel debe actualizarse sin necesidad de recargar la página (tiempo real vía WebSocket). Los despachos en estado pendiente por más de 24 horas aparecen como alerta de advertencia. |

### 2.7 Módulo de Indicadores y Reportes

#### RF-17 — Dashboard de indicadores KPI

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe mostrar un dashboard gerencial con los indicadores operativos clave del centro de distribución. |
| **Actores** | Administrador del sistema, Jefe de almacén |
| **Prioridad** | Alta |
| **Entradas** | Datos de movimientos, lotes y productos del período seleccionado. |
| **Salidas** | Dashboard con cuatro indicadores principales: (1) **Rotación de inventario** — índice por categoría de producto, gráficos de tendencia y alertas de productos con baja rotación; (2) **Exactitud de inventario** — porcentaje de coincidencia entre registros del sistema y conteo físico; (3) **Nivel de servicio** — porcentaje de despachos completados a tiempo, con desglose por período y destino interno; (4) **Utilización de almacén** — mapa de ocupación con porcentaje de capacidad usada por bodega (principal, producción, neveras). |
| **Reglas de negocio** | El dashboard debe permitir filtrar por período (semana, mes, rango personalizado). Los gráficos deben ser interactivos. Solo accesible para Administrador del sistema y Jefe de almacén. Los productos con rotación inferior al umbral definido se resaltan como alerta de baja rotación. |

#### RF-18 — Generación y exportación de reportes

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe permitir generar reportes de indicadores operativos y exportarlos en formato Excel. |
| **Actores** | Administrador del sistema, Jefe de almacén |
| **Prioridad** | Alta |
| **Entradas** | Tipo de reporte, período, filtros opcionales (categoría, producto, bodega). |
| **Salidas** | Archivo Excel descargable con los indicadores consolidados del período seleccionado. |
| **Reglas de negocio** | El reporte en Excel debe poder ser editado por el usuario una vez descargado. El sistema también debe ofrecer exportación en PDF como alternativa de solo lectura. Solo accesible para Administrador del sistema y Jefe de almacén. |

#### RF-19 — Documentación de API con Swagger

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe exponer documentación interactiva de todos sus endpoints mediante Swagger (OpenAPI). |
| **Actores** | Equipo de desarrollo (acceso técnico) |
| **Prioridad** | Media |
| **Entradas** | N/A — se genera automáticamente desde las definiciones de la API. |
| **Salidas** | Interfaz Swagger UI accesible en una ruta del sistema con todos los endpoints documentados: parámetros, respuestas, códigos de error y ejemplos. |
| **Reglas de negocio** | La documentación debe reflejar los endpoints reales del sistema. Incluye los módulos de inventario, lotes, recepción, despacho, alertas e indicadores. |

---

## 3. Requisitos No Funcionales

Los requisitos no funcionales definen las características de calidad que el sistema debe cumplir, independientemente de las funcionalidades específicas.

### RNF-01 — Rendimiento

| Campo | Contenido |
|---|---|
| **Descripción** | Las consultas de inventario y stock deben responder en menos de 2 segundos bajo condiciones normales de uso (hasta 5 usuarios simultáneos). |
| **Criterio de Aceptación** | Tiempo de respuesta < 2 seg en el 95% de las consultas. |
| **Prioridad** | Alta |

### RNF-02 — Disponibilidad

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe estar disponible durante la jornada operativa del centro de distribución (8:00 a.m. – 6:00 p.m.) con un uptime mínimo del 99%. |
| **Criterio de Aceptación** | Uptime >= 99% en horario operativo. Caídas máximas de 6 min/día. |
| **Prioridad** | Alta |

### RNF-03 — Seguridad

| Campo | Contenido |
|---|---|
| **Descripción** | Toda la comunicación entre el cliente y el servidor debe realizarse mediante HTTPS. Las contraseñas deben almacenarse cifradas con bcrypt. Cada endpoint valida el rol del usuario. |
| **Criterio de Aceptación** | 100% de endpoints protegidos. Contraseñas nunca almacenadas en texto plano. |
| **Prioridad** | Alta |

### RNF-04 — Usabilidad

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe ser intuitivo para usuarios no técnicos. Un nuevo operador debe poder registrar una entrada de mercancía sin capacitación formal, siguiendo solo la interfaz. |
| **Criterio de Aceptación** | Usuario nuevo completa tarea principal en < 5 minutos sin asistencia. |
| **Prioridad** | Alta |

### RNF-05 — Compatibilidad

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe funcionar correctamente en los navegadores Chrome, Firefox y Edge en sus versiones actuales, en dispositivos de escritorio (resolución mínima 1280x720). |
| **Criterio de Aceptación** | Sin errores funcionales en los 3 navegadores requeridos. |
| **Prioridad** | Media |

### RNF-06 — Mantenibilidad

| Campo | Contenido |
|---|---|
| **Descripción** | El código debe seguir los principios SOLID, KISS y DRY. La cobertura de pruebas unitarias del backend debe ser mínimo del 70%. |
| **Criterio de Aceptación** | Cobertura de pruebas >= 70%. Sin advertencias de deuda técnica crítica. |
| **Prioridad** | Alta |

### RNF-07 — Escalabilidad

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe soportar el crecimiento del catálogo de productos de 60 a 200 referencias sin degradar el rendimiento. |
| **Criterio de Aceptación** | Tiempo de respuesta se mantiene < 2 seg con 200 productos y 1000 lotes. |
| **Prioridad** | Media |

### RNF-08 — Protección de datos

| Campo | Contenido |
|---|---|
| **Descripción** | El sistema debe cumplir con la Ley 1581 de 2012 de protección de datos personales de Colombia. Los datos operativos del centro de distribución deben manejarse con confidencialidad. |
| **Criterio de Aceptación** | Cumplimiento verificable con la normativa colombiana. Acuerdo de confidencialidad firmado con la empresa. |
| **Prioridad** | Alta |

---

## 4. Restricciones del Sistema

- El sistema se desarrolla como una aplicación web (no nativa). El acceso principal es desde PC de escritorio.
- El frontend se implementa con Next.js 15 (App Router) y React.
- El backend se implementa con Next.js Route Handlers y Server Actions (sin servidor separado).
- La base de datos es PostgreSQL 16 gestionado por Supabase, para garantizar integridad referencial.
- La bodega está organizada en tres espacios físicos: **bodega principal**, **bodega de producción** y **área de neveras/refrigerados**.
- El sistema NO gestiona el punto de venta ni el despacho a clientes externos.
- El sistema NO maneja proveedores como entidad (no se registra proveedor por producto).
- El período de desarrollo es del 21 de abril al 26 de junio de 2026 (tres cortes académicos).
- El entregable final es un MVP funcional, no un sistema en producción completo.

---

## 5. Matriz de Trazabilidad Requisitos — Módulos

La siguiente tabla vincula cada requisito funcional con el módulo del sistema y el corte académico en que se implementa.

| ID | Requisito | Módulo | Corte | Prioridad |
|---|---|---|---|---|
| RF-00 | Gestión de usuarios | Autenticación | Corte 1 | Alta |
| RF-01 | Inicio de sesión | Autenticación | Corte 1 | Alta |
| RF-02 | Control de acceso por rol | Autenticación | Corte 1 | Alta |
| RF-03 | Cierre de sesión | Autenticación | Corte 1 | Media |
| —  | Wireframes y prototipos interactivos (entregable Programación Web) | Diseño UI | Corte 1 | Alta |
| RF-04 | Registro de producto | Inventario | Corte 2 | Alta |
| RF-05 | Consulta y búsqueda de productos | Inventario | Corte 2 | Alta |
| RF-06 | Edición de producto | Inventario | Corte 2 | Media |
| RF-07 | Configuración de punto de reorden | Inventario | Corte 2 | Alta |
| RF-08 | Registro de lote | Lotes | Corte 2 | Alta |
| RF-09 | Consulta de lotes por producto | Lotes | Corte 2 | Alta |
| RF-10 | Registro de orden de recepción | Recepción | Corte 2 | Alta |
| RF-11 | Consulta de órdenes de recepción | Recepción | Corte 2 | Media |
| RF-12 | Registro y aprobación de despacho | Despacho | Corte 2 | Alta |
| RF-13 | Consulta de despachos | Despacho | Corte 2 | Media |
| RF-14 | Alertas de stock mínimo | Alertas | Corte 3 | Alta |
| RF-15 | Alertas de vencimiento próximo | Alertas | Corte 3 | Alta |
| RF-16 | Panel de alertas operativas (realtime) | Alertas | Corte 3 | Alta |
| RF-17 | Dashboard de indicadores KPI | Indicadores | Corte 3 | Alta |
| RF-18 | Generación y exportación de reportes | Indicadores | Corte 3 | Alta |
| RF-19 | Documentación de API con Swagger | Documentación | Corte 3 | Media |

---

## 6. Aspectos Pendientes de Validación con Ingeniería Industrial

Los siguientes puntos quedaron sin definir en la reunión inicial y deben ser confirmados con el cliente funcional (estudiantes de Ingeniería Industrial) antes del cierre del Corte 1:

- ¿Cuál es el límite mínimo de días antes del vencimiento para aceptar cada tipo de producto? (Confirmado para harina: 3 meses. Pendiente para demás productos.)
- ¿Los productos tienen unidad de medida variable? (unidades, kg, litros...) ¿O todos se manejan en unidades?
- ¿El picking (armado de pedidos dentro de la bodega) es un proceso que el sistema debe soportar?
- ¿Cuántos usuarios simultáneos se esperan en el sistema en un momento dado?
- ¿El sistema necesita enviar notificaciones por correo o solo muestra alertas dentro de la aplicación?

---

## 7. Referencias

- Pressman, R. S. y Maxim, B. R. (2021). *Ingeniería del software: Un enfoque práctico* (9.ª ed.). McGraw-Hill.
- IEEE Std 830-1998. *IEEE Recommended Practice for Software Requirements Specifications*.
- Guía del Proyecto Nuclear 3 — SGIL. Corporación Universitaria Alexander von Humboldt. I-2026.
- Registro de reunión con estudiantes de Ingeniería Industrial (cliente funcional). Mayo 2026.
