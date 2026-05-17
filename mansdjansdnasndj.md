Guión de demostración                                                                                             
                                                                                                                      
  Entregable 2 — Autenticación y roles                                                                              
                                                                                                                      
  Escenario 1: acceso sin sesión                                                                                    
  - Abrir http://localhost:5175 sin estar logueado.                                                                   
  - El sistema redirige automáticamente a /login → demuestra el guard de sesión.                                      
                                                                                
  Escenario 2: login y rol                                                                                            
  - Iniciar sesión como admin@sgil.test / Test1234!.                                                                  
  - Mostrar el header: nombre "Ana Gómez" + etiqueta "Administrador del sistema".                                     
  - Mostrar el sidebar con todos los módulos visibles.                                                                
                                                                                                                      
  Escenario 3: control de acceso por rol                                                                              
  - Cerrar sesión. Entrar como recepcion@sgil.test / Test1234!.                                                       
  - Mostrar que el sidebar no tiene Reportes/KPI ni Gestión de usuarios.                                              
  - Ir manualmente a http://localhost:5175/reportes → el sistema devuelve 403 Forbidden (no redirige, bloquea). Eso es
   requerirRol() actuando.                                                                                            
                                                                                                                      
  Escenario 4: botones condicionales por rol                                                                          
  - Con recepcion@sgil.test abrir /despachos → no aparece el botón "Aprobar".                                         
  - Con admin@sgil.test abrir /despachos → el botón "Aprobar" sí aparece en cada fila pendiente.                      
                                                                                                                      
  ---                                                                                                                 
  Entregable 1 — Wireframes y prototipos                                                                            
                                                                                                                      
  Con admin@sgil.test mostrar en orden:                                                                             
                                                                                                                      
  ┌─────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────┐
  │  Pantalla   │                                           Qué señalar                                            │  
  ├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Dashboard / │ Tarjetas de acceso rápido — con despacho@sgil.test aparecen menos tarjetas                       │
  ├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ /inventario │ Tabla con badge de alerta (Normal / Stock bajo / Crítico), búsqueda y filtro de categoría        │  
  │             │ visibles, botón "Nuevo producto"                                                                 │  
  ├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ /recepcion  │ Estados coloreados (Recibida, Con diferencias, Cancelada), botón "Nueva recepción"               │  
  ├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ /despachos  │ Botón "Aprobar" por fila (solo aparece en filas "Pendiente")                                     │
  ├─────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────┤  
  │ /reportes   │ 4 KPI cards + bar chart + pie chart interactivo con Recharts                                     │
  └─────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────┘  
                                                                                                                    
  Para el cierre: cambiar a despacho@sgil.test y mostrar que /reportes da 403 y el botón "Nueva recepción" desaparece 
  en /recepcion. Eso demuestra que los prototipos no son solo visuales — el control de acceso ya es funcional.