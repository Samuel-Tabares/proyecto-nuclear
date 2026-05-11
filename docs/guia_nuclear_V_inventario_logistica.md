# GUIA PARA LA ELABORACIÓN DEL PROYECTO DEL SEMINARIO NUCLEAR

**Código:** 
**Versión:** 
**Fecha:** 

---

## 1. Identificación del proyecto

| Aspecto | Detalle |
|--------|---------|
| **Programa académico** | Ingeniería de Software |
| **Proyecto nuclear** | 3 |
| **Periodo académico** | I-2026 |
| **Título general del proyecto** | Sistema de gestión de inventario y logística para centros de distribución — Integración Ingeniería de Software e Ingeniería Industrial |

### Asignaturas que participan del proyecto

| Asignatura | Nombre del docente | Correo electrónico |
|-----------|-------------------|------------------|
| Arquitectura de software I | Santiago Jaramillo L. | sjaramillo1027@cue.edu.co |
| Programación con tecnologías web | Santiago Jaramillo L. | sjaramillo1027@cue.edu.co |
| Pruebas de software | Jose Alfredo Ramirez | |

---

## 2. Eje problémico del proyecto del seminario nuclear

Los centros de distribución de la región del Quindío enfrentan un desafío operativo recurrente: la gestión manual o fragmentada de sus procesos de inventario, recepción de mercancía, almacenamiento, despacho y trazabilidad logística. Esta situación genera pérdidas por descontrol de existencias, tiempos muertos en la preparación de pedidos, errores en la rotación de productos y una visibilidad limitada sobre los indicadores operativos que sustentan la toma de decisiones gerenciales. 

La Corporación Universitaria Alexander von Humboldt, en el marco de su modelo de formación dual, identifica esta problemática como una oportunidad de integración interdisciplinar entre los programas de Ingeniería de Software e Ingeniería Industrial. Los estudiantes de Ingeniería Industrial, que realizan su práctica empresarial en centros de distribución reales, actuarán como clientes funcionales y asesores técnicos del dominio logístico, mientras los estudiantes de Ingeniería de Software diseñarán, construirán y validarán un producto mínimo viable (MVP) que responda a las necesidades concretas del centro de distribución donde se desarrolla la práctica. 

Este esquema convierte el proyecto nuclear en un ejercicio de transferencia tecnológica directa entre la universidad y el sector productivo.

---

## 3. Eje problémico en el cual giran las asignaturas

Este proyecto integra tres asignaturas del programa de Ingeniería de Software: Arquitectura de Software I, Programación con Tecnologías Web y Pruebas de Software, articuladas con la participación activa de estudiantes de Ingeniería Industrial en calidad de clientes funcionales y asesores del dominio logístico. 

### Arquitectura de Software I

Proporciona el marco para diseñar una arquitectura sólida, escalable y mantenible para el sistema de inventario y logística. Los estudiantes aplicarán conceptos como drivers arquitectónicos, atributos de calidad (rendimiento en consultas de inventario en tiempo real, disponibilidad del sistema durante jornadas operativas, seguridad en el acceso por roles y escalabilidad ante el crecimiento del catálogo de productos), principios SOLID y métodos de diseño de arquitectura. Se documentarán las decisiones mediante ADRs (Architecture Decisión Records) y se modelará el sistema con diagramas de arquitectura. 

La interacción con los estudiantes de Ingeniería Industrial permitirá validar que las decisiones arquitectónicas respondan a las restricciones operativas reales del centro de distribución.

### Pruebas de Software

Complementa la calidad estructural garantizada por la arquitectura con la calidad funcional verificable. Esta asignatura aporta el diseño del plan de pruebas del sistema, la definición de casos de prueba derivados de los requisitos funcionales levantados con los estudiantes de Ingeniería Industrial, la ejecución de pruebas unitarias, de integración, funcionales y de aceptación, y el análisis de los resultados para retroalimentar el ciclo de desarrollo. 

Se aplicarán técnicas de caja negra y caja blanca, se utilizarán herramientas de automatización de pruebas y se generarán informes de cobertura y defectos que alimenten las decisiones del equipo en cada iteración.

### Programación con Tecnologías Web

Brindará las herramientas y habilidades para implementar el diseño arquitectónico. Los estudiantes desarrollarán tanto el frontend como el backend. Se utilizarán tecnologías modernas como HTML, CSS, JavaScript, y frameworks como Angular, React o Vue.js, además de bases de datos SQL o NoSQL. La comunicación en tiempo real y la seguridad de los datos serán aspectos clave en el desarrollo.

---

## 4. Descripción del proyecto nuclear

El proyecto nuclear consiste en el desarrollo de un sistema web de gestión de inventario y logística para centros de distribución que aborda los desafíos de control de existencias, trazabilidad de mercancía, eficiencia en la preparación de pedidos y generación de indicadores operativos. El sistema se desarrolla en alianza con estudiantes de Ingeniería Industrial que aportan el conocimiento del dominio logístico desde sus centros de práctica empresarial. 

### Módulos principales

#### Módulo de Gestión de Inventario

Permite el registro, consulta, actualización y baja de productos en el inventario del centro de distribución. Incluye la clasificación por categorías, la asignación de ubicaciones de almacenamiento (rack, pasillo, nivel, etc), el control de lotes con fechas de vencimiento, la configuración de puntos de reorden y alertas automáticas de stock mínimo. 

Los estudiantes de Ingeniería Industrial definirán los criterios de clasificación y las políticas de rotación que el sistema debe implementar.

#### Módulo de recepción y despacho

Permite registrar los pedidos que han llegado al centro logístico, permitiendo agregar productos nuevos en el inventario, parametrizados con los datos que cada uno lleve. De igual forma, en este módulo se gestionan los pedidos que saldrán de la bodega para sus respectivas rutas de entrega, permitiendo descontar productos del stock; procurando siempre tener la información de todos los productos y su stock siempre al día.

#### Módulo de Indicadores y Reportes

Un dashboard gerencial que consolida los indicadores clave de operación (KPI) del centro de distribución:

- **Rotación de inventario:** Índice de rotación por categoría de producto, con gráficos de tendencia y alertas de productos de baja rotación.

- **Nivel de servicio:** Porcentaje de pedidos despachados completos y a tiempo, con desglose por período y cliente.

- **Utilización de almacén:** Mapa de ocupación de ubicaciones con visualización del porcentaje de capacidad utilizada por zona.

- **Alertas operativas:** Panel de alertas en tiempo real sobre productos próximos a vencer, stock por debajo del punto de reorden y pedidos pendientes de despacho.

- **Exportación de reportes:** Generación y descarga de reportes en formato PDF y/o Excel con los indicadores consolidados, filtrados por período, categoría o zona de almacenamiento, para apoyar la toma de decisiones gerenciales.

### Implementación

La implementación de este sistema busca centralizar y automatizar los procesos operativos del centro de distribución, mejorar la trazabilidad de la mercancía, reducir las pérdidas por descontrol de inventario y fortalecer la capacidad gerencial mediante indicadores oportunos y confiables. El carácter interdisciplinar del proyecto garantiza que la solución no solo sea técnicamente robusta, sino operativamente pertinente para el contexto real donde será implantada.

---

## 5. Justificación del proyecto del seminario nuclear

El desarrollo de un sistema web de gestión de inventario y logística para centros de distribución se justifica en la necesidad de mejorar la eficiencia operativa, la trazabilidad y la competitividad del sector. 

### Perspectiva social y organizacional

Desde un punto de vista social y organizacional, la plataforma permitirá a los centros de distribución gestionar sus procesos de inventario y logística de manera más eficiente. Al centralizar la información y automatizar procesos, se reducirá la carga administrativa, permitiendo al personal operativo enfocarse en las actividades de valor. La trazabilidad completa de los movimientos de mercancía fortalecerá el control operativo y facilitará la toma de decisiones basada en datos confiables.

### Perspectiva de integración interdisciplinar e innovación pedagógica

Este proyecto materializa un modelo de colaboración entre los programas de Ingeniería de Software e Ingeniería Industrial que trasciende el ejercicio académico convencional. Los estudiantes de Ingeniería Industrial, inmersos en sus centros de práctica empresarial, aportan el conocimiento profundo del dominio logístico, las restricciones operativas reales y la validación funcional de la solución, actuando como clientes y asesores técnicos. 

Los estudiantes de Ingeniería de Software traducen ese conocimiento en una arquitectura robusta, código funcional y un plan de pruebas riguroso. Esta dinámica reproduce las condiciones de un proyecto de desarrollo de software real donde el equipo técnico debe comunicarse, negociar y validar continuamente con el cliente del dominio.

### Perspectiva académica

En el ámbito académico, este proyecto articula tres asignaturas clave de quinto semestre (Arquitectura de Software I, Programación con Tecnologías Web y Pruebas de Software) en torno a un problema real con impacto productivo verificable. 

La complejidad del sistema, que integra gestión de inventario con control de lotes, flujos de recepción y despacho, dashboards de indicadores y generación de reportes, ofrece un entorno formativo exigente donde los estudiantes desarrollan competencias técnicas de alta demanda (diseño arquitectónico, desarrollo full-stack, automatización de pruebas) y competencias transversales (comunicación interdisciplinar, análisis de dominio, trabajo en equipo y resolución de problemas en contextos reales). 

La experiencia de trabajar con un cliente real proveniente de otra disciplina prepara al estudiante para las dinámicas profesionales que enfrentará en el ejercicio de su carrera.

---

## 6. Objetivo general del proyecto

Desarrollar el producto mínimo viable de un sistema web de gestión de inventario y logística para centros de distribución, mediante la integración de arquitectura de software, programación con tecnologías web y pruebas de software, con el fin de centralizar el control de existencias, automatizar los flujos de recepción y despacho, y generar indicadores operativos que apoyen la toma de decisiones gerenciales en el centro de práctica empresarial.

---

## 7. Resultados de aprendizaje por asignatura académica

### Arquitectura de software I

- **RDA1:** Reconoce los conceptos fundamentales de la arquitectura de software y aplica estos conceptos en la implementación de productos software.

- **RDA2:** Identifica los diferentes tipos de arquitectura involucrados en el desarrollo de un sistema desde su concepto de negocio hasta su implementación tecnológica.

- **RDA3:** Implementa tácticas de arquitectura priorizando los atributos de calidad más pertinentes de acuerdo con el contexto de uso del sistema.

- **RDA4:** Reconoce e implementa métodos de diseño de arquitectura acordes con las necesidades del proyecto.

### Programación con tecnologías web

- **RDA1:** Comprende y aplica los fundamentos de desarrollo de aplicaciones web.

- **RDA2:** Implementa aplicaciones del lado del cliente utilizando frameworks y las tecnologías vistas en clase.

- **RDA3:** Desarrolla aplicaciones del lado del servidor haciendo uso de frameworks y las tecnologías vistas en clase.

- **RDA4:** Comprende el contexto de uso de las estrategias y mecanismos para la implementación en tiempo real.

### Pruebas de Software

- **RDA1:** Diseña planes de prueba alineados con los requisitos funcionales y no funcionales del sistema, aplicando técnicas de caja negra y caja blanca.

- **RDA2:** Implementa y ejecuta pruebas unitarias, de integración y funcionales utilizando herramientas de automatización, generando informes de cobertura y defectos.

- **RDA3:** Analiza los resultados de las pruebas para retroalimentar el ciclo de desarrollo y garantizar la calidad del producto entregado.

---

## 8. Metodología

El desarrollo del sistema se llevará a cabo utilizando una metodología ágil basada en Scrum, organizada en sprints alineados con los tres cortes académicos del período (21 de abril al 26 de junio de 2026). Los estudiantes de Ingeniería Industrial participarán como Product Owners funcionales, aportando los requisitos del dominio logístico desde sus centros de práctica, mientras los estudiantes de Ingeniería de Software conformarán el equipo de desarrollo. Esta aproximación permite un desarrollo iterativo con validación continua del cliente real.

### Fases del proceso

#### Fase de Análisis de Dominio y Planificación (Corte 1)

Se realizarán sesiones de trabajo conjunto entre los equipos de Ingeniería de Software e Ingeniería Industrial para comprender los flujos operativos del centro de distribución (recepción, almacenamiento, picking, despacho). Los estudiantes de Industrial aportarán diagramas de flujo de procesos, layouts de almacén y métricas operativas actuales. 

Se levantarán los requisitos funcionales y no funcionales, se elaborará el Product Backlog priorizado y se diseñará la arquitectura base del sistema.

#### Fase de Diseño e Implementación del Núcleo (Corte 2)

Se implementarán los módulos críticos del sistema (gestión de inventario, recepción y despacho) aplicando la arquitectura definida en el corte anterior. Se ejecutarán las primeras pruebas unitarias y de integración. Los estudiantes de Industrial validarán cada módulo contra los procedimientos operativos estándar del centro de distribución, retroalimentando al equipo de desarrollo.

#### Fase de Integración, Pruebas y Entrega (Corte 3)

Se completará la implementación del módulo de indicadores y reportes, se ejecutará el plan de pruebas completo (funcionales, de rendimiento, de seguridad y de aceptación) y se realizará el despliegue del MVP. 

La asignatura de Pruebas de Software liderará la ejecución de las pruebas de aceptación con los estudiantes de Ingeniería Industrial en el contexto operativo real del centro de distribución, generando el informe final de calidad con métricas de cobertura, defectos encontrados y resueltos, y dictamen de aptitud del producto. 

Paralelamente, Arquitectura de Software I conducirá la evaluación arquitectónica formal y la verificación de principios SOLID en el código entregado.

#### Integración Interdisciplinar Transversal

A lo largo de todo el proyecto, los estudiantes de Ingeniería Industrial participarán en las ceremonias de Scrum (planning, review, retrospectiva) aportando la perspectiva del dominio logístico. Esta integración garantiza que la solución técnica esté permanentemente alineada con las necesidades operativas reales y que ambos programas se beneficien de la experiencia colaborativa.

---

## 9. Entregables

### Primer Corte

#### Programación de Tecnologías Web

1. **Documento de análisis de dominio y diseño de interfaces:** Wireframes y prototipos interactivos de las pantallas principales del sistema (gestión de inventario, recepción, despacho, dashboard de indicadores). Se incluirá la justificación de decisiones de diseño validadas con los estudiantes de Ingeniería Industrial como usuarios funcionales del dominio.

2. **Sistema de autenticación y gestión de roles (Frontend y Backend):** Implementación funcional del sistema de autenticación con roles diferenciados: administrador del sistema, jefe de almacén, operador de recepción y operador de despacho.

#### Arquitectura de Software

1. **Documento de arquitectura base:** Definición detallada de la arquitectura del sistema de inventario y logística, incluyendo diagrama de arquitectura de alto nivel, modelo de datos (diagrama ER de la base de datos), patrones de diseño seleccionados. Se incluirán los atributos de calidad priorizados y las tácticas arquitectónicas para cumplirlos, justificados con ADRs (Architecture Decision Records).

2. **Entorno de desarrollo configurado:** Repositorio Git con estructura de proyecto base, y documentación de los drivers arquitectónicos.

#### Pruebas de Software

1. **Plan maestro de pruebas:** Diseño del plan de pruebas alineado con los requisitos funcionales y no funcionales del sistema. Incluye la definición de casos de prueba para los módulos críticos (inventario, recepción, despacho), los criterios de aceptación derivados de los flujos operativos del centro de distribución y la selección de herramientas de automatización (Jest, Cypress, JUnit o equivalentes).

2. **Matriz de trazabilidad requisitos-pruebas:** Documento que vincula cada requisito funcional con sus casos de prueba correspondientes, asegurando cobertura completa y permitiendo el seguimiento del estado de verificación de cada funcionalidad.

### Segundo Corte

#### Programación de Tecnologías Web

1. **Módulos funcionales del sistema:** Desarrollo completo de los módulos de inventario, recepción y despacho con sus respectivas interfaces.

#### Arquitectura de Software

1. **Validación de principios arquitectónicos:** Aplicación de los principios KISS, DRY y YAGNI.

2. **Evaluación de atributos de calidad:** Evaluación de los atributos de calidad priorizados (rendimiento, disponibilidad, seguridad) mediante escenarios de calidad documentados.

#### Pruebas de Software

3. **Ejecución de pruebas unitarias y de integración:** Implementación y ejecución de pruebas unitarias para los componentes del backend (lógica de negocio de inventario, rotación FIFO/FEFO, cálculo de alertas) y pruebas de integración para verificar la comunicación entre frontend, backend y base de datos. Informe de cobertura de código.

4. **Informe de defectos del ciclo de desarrollo:** Registro estructurado de los defectos encontrados durante las pruebas, clasificados por severidad y prioridad, con el estado de resolución de cada uno. Este informe retroalimenta al equipo de desarrollo para las correcciones previas al corte final.

### Tercer Corte

#### Programación de Tecnologías Web

1. **Módulo de indicadores y reportes:** Implementación del dashboard de indicadores operativos (rotación de inventario, exactitud, nivel de servicio, utilización de almacén) con gráficos interactivos y generación de reportes exportables en PDF y/o Excel.

2. **Panel de alertas operativas:** Implementación del sistema de alertas en tiempo real: productos próximos a vencer, stock por debajo del punto de reorden y pedidos pendientes de despacho.

3. **Documentación:** Endpoints documentados con swagger.

#### Arquitectura de Software

1. **Principios SOLID aplicados:** Verificación de la aplicación de principios SOLID (SRP, OCP, LSP, ISP, DIP) en la arquitectura y el código del sistema. Informe de refactorización y deuda técnica.

2. **Despliegue, evaluación arquitectónica y pruebas de aceptación:** Configuración del entorno de producción, despliegue, y realización de la evaluación arquitectónica.

#### Pruebas de Software

5. **Ejecución de pruebas funcionales y de aceptación:** Ejecución del plan de pruebas completo sobre el MVP integrado: pruebas funcionales de todos los módulos, pruebas de rendimiento bajo carga simulada y pruebas de aceptación conducidas por los estudiantes de Ingeniería Industrial en el contexto operativo real del centro de distribución.

6. **Informe final de calidad del MVP:** Documento consolidado con métricas de cobertura de pruebas, resumen de defectos encontrados y resueltos, resultados de las pruebas de aceptación, y dictamen de calidad del producto entregado. Incluye recomendaciones para la evolución del sistema posterior al proyecto nuclear.

### Documento Resumen

- **Resumen (Abstract):** Es una breve descripción del alcance y contenido general del artículo. Debe ser conciso y permitir al lector entender rápidamente de qué trata el proyecto.

- **Introducción:** Esta sección presenta el tema central del artículo, proporcionando el contexto y la motivación necesarios para que el lector comprenda la importancia del trabajo realizado.

- **Desarrollo de contenidos:** Es la sección principal, donde se exponen de manera detallada y estructurada los contenidos del artículo. Debe dividirse en secciones y subsecciones claramente identificadas con títulos y subtítulos.

- **Figuras y tablas:** Se deben incluir figuras (gráficos, diagramas, imágenes) y tablas para ilustrar y complementar la información presentada en el texto. Deben estar correctamente numeradas, tituladas y referenciadas en el cuerpo del artículo.

- **Referencias:** Es una lista numerada de todas las fuentes bibliográficas citadas en el artículo, siguiendo un formato específico según el tipo de referencia (libro, artículo, sitio web, etc.).

- **Conclusiones:** En esta sección se resumen los principales hallazgos y resultados obtenidos en el proyecto, destacando las contribuciones más relevantes.

- **Reconocimientos (opcional):** Se pueden incluir agradecimientos a personas o instituciones que hayan colaborado o apoyado el desarrollo del proyecto, pero que no figuran como autores del artículo.

---

## 10. Evaluación

| Corte | RDA | Evidencia | Porcentaje del P. N | Porcentaje total corte |
|-------|-----|-----------|-------------------|----------------------|
| Primer corte | RDA 1, 2 | Descritas ítem de entregables anteriores | 30% | 30% |
| Segundo corte | RDA 3 | Descritas ítem de entregables anteriores | 30% | 30% |
| Tercer corte | RDA 4 | Descritas ítem de entregables anteriores | 40% | 40% |

---

## 11. Cronograma de actividades del proyecto

| Fecha | Actividad | Recursos | Responsable |
|-------|-----------|----------|------------|
| Corte 1 | Análisis de dominio, arquitectura base, plan de pruebas, autenticación y prototipos de interfaz — validados con Ingeniería Industrial. | Equipo del proyecto | Equipo del proyecto |
| Corte 2 | Módulos de inventario, recepción y despacho funcionales. Pruebas unitarias y de integración. Validación de principios arquitectónicos. | Equipo del proyecto | Equipo del proyecto |
| Corte 3 | Dashboard de indicadores, alertas operativas, pruebas de aceptación con Ingeniería Industrial, despliegue y sustentación final del MVP. | Equipo del proyecto | Equipo del proyecto |

Las fechas y lugares de ejecución del proyecto son susceptibles a cambios, según necesidades del programa o directrices de la decanatura.

---

## 12. Aspectos éticos y Disciplinarios

El desarrollo de este sistema implica una responsabilidad ética y disciplinaria significativa, tanto por el manejo de información operativa y comercial sensible de los centros de distribución como por la naturaleza interdisciplinar del proyecto.

### Aspectos Éticos

#### Privacidad y Protección de Datos

Se implementarán políticas claras para la recolección, almacenamiento y uso de datos operativos y comerciales, cumpliendo con la normativa colombiana de protección de datos (Ley 1581 de 2012) y los acuerdos de confidencialidad con los centros de distribución donde los estudiantes de Ingeniería Industrial realizan su práctica. 

Es fundamental obtener autorización expresa de las empresas para el uso de datos operativos en el contexto del proyecto académico.

#### Seguridad

Se garantizará la seguridad de la información del centro de distribución mediante la implementación de roles de acceso diferenciados, cifrado de datos sensibles en tránsito y en reposo, y políticas de respaldo que protejan la integridad de la información operativa.

#### Inclusión y Accesibilidad

El diseño de la plataforma se realizará bajo principios de accesibilidad universal para garantizar que sea usable por personas con diversas capacidades, alineándose con estándares como WCAG 2.1.

#### Calidad académica y plagio

Se espera que todo el trabajo sea original. El plagio es una falta grave y tendrá consecuencias académicas. El equipo debe asegurar la alta calidad del diseño y la implementación, así como un plan de entregas organizado.

#### Gobernanza y sostenibilidad

Los equipos de Ingeniería de Software e Ingeniería Industrial deberán contribuir de manera equitativa y profesional, manteniendo una comunicación interdisciplinar abierta y constante para asegurar que la solución propuesta se adapte a las necesidades operativas reales del centro de distribución, promoviendo así la sostenibilidad y transferibilidad del proyecto.

### Aspectos Disciplinarios

#### Código de Conducta

- Establecimiento de normas claras de comportamiento para todos los usuarios de la plataforma.
- Definición de procesos transparentes para abordar violaciones al código de conducta.

#### Sostenibilidad de la Comunidad

- Implementación de estrategias para incentivar la participación activa y constante.
- Creación de roles y responsabilidades que distribuyan la carga de mantenimiento de la comunidad.

---

## 13. Asesoría y acompañamiento

Las asesorías se acordarán con cada uno de los grupos por medio del correo electrónico.

---

## 14. Bibliografía y Recursos educativos

- Pressman, R. S. y Maxim, B. R. (2021). Ingeniería del software: Un enfoque práctico (9.a ed.). McGraw-Hill.

- Bass, L., Clements, P. y Kazman, R. (2021). Software Architecture in Practice (4.a ed.). Addison-Wesley.

- Myers, G. J., Sandler, C. y Badgett, T. (2011). The Art of Software Testing (3.a ed.). Wiley.

- Ballou, R. H. (2004). Logística: Administración de la cadena de suministro (5.a ed.). Pearson Educación.

- Schwaber, K. y Sutherland, J. (2020). La Guía Scrum. https://scrumguides.org

### Rúbricas

Ver la rúbrica institucional.
