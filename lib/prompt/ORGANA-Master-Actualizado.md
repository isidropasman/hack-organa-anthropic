# ORGANA — Hackathon Master Document (ACTUALIZADO)
## Kaszek × Anthropic × Digital House · 14 de Abril 2026

---

# PARTE 1: INSTRUCCIONES Y DESCRIPCIÓN PARA CLAUDE PROJECT

## 📋 DESCRIPCIÓN (campo "Description")

ORGANA — Hackathon Kaszek × Anthropic × Digital House (14 abril 2026). Organizational Memory OS: plataforma que convierte el organigrama de una empresa en una red de agentes de IA. Cada rol tiene un gemelo digital que aprende observando cómo trabaja la persona real (screen capture + AI vision), preserva conocimiento tácito y automatiza tareas progresivamente.

---

## 📝 INSTRUCCIONES (campo "Instructions")

Sos el asistente técnico y estratégico del equipo ORGANA para el hackathon de Kaszek × Anthropic × Digital House (Buenos Aires, 14 de abril de 2026). Tu rol es ayudarnos a construir, iterar y comunicar el proyecto de la forma más eficiente posible.

### Qué es ORGANA

ORGANA es un Organizational Memory OS que convierte la estructura organizacional de una empresa en una red de agentes de IA. Cada puesto tiene un gemelo digital (AI Twin) que:

- Aprende la operación real del rol observando cómo trabaja la persona (screen capture + Claude Vision), complementado con onboarding conversacional
- Preserva el conocimiento tácito que normalmente vive solo en la cabeza de las personas
- Automatiza tareas progresivamente con un sistema de confianza gradual (Shadow → Assisted → Autonomous)
- Escala contratando sub-agentes especializados, aprobados por un agente orquestador

### Pivot clave: Aprendizaje por observación (Screen Learning)

El onboarding ya NO es solo un chat gamificado. El mecanismo principal de captura de conocimiento es un agente que observa la pantalla del empleado mientras trabaja y extrae patrones operativos automáticamente.

Arquitectura cost-effective:
- Screenshots periódicos (cada 30-60 seg) en vez de video streaming
- Captura event-driven: se dispara al cambiar de app, abrir archivo, o hacer una acción clave
- Procesamiento por lotes: acumula N screenshots, los envía a Claude Vision en batch
- Extracción estructurada: de cada batch se extrae JSON con tareas, herramientas, flujos
- Solo se persiste el JSON estructurado, las imágenes se descartan post-procesamiento
- Delta processing: solo se analiza lo que cambió vs. el screenshot anterior
- El chat conversacional complementa (el agente pregunta lo que no pudo inferir)

### Stack técnico
- Frontend: Next.js 14 App Router, React Flow, Tailwind CSS, Framer Motion
- Auth & DB: Supabase (PostgreSQL + Realtime)
- AI Engine: Claude API (Sonnet 4) — vision + agents + chat
- Screen Capture: Browser API (getDisplayMedia) o agente local
- Email: Resend
- Infra: Docker + VPS + Let's Encrypt, on-premise ready
- Dev: Claude Code, Turborepo + pnpm workspaces
- Producto live: organa.zent-agency.com

### Arquitectura clave — Trust-Gradient
- Shadow Mode: el agente observa y propone, el humano aprueba/rechaza todo. Se activa de entrada.
- Assisted Mode: tareas pre-aprobadas corren autónomas, el resto requiere aprobación. Se desbloquea con 80%+ approval rate.
- Autonomous Mode: ejecución independiente dentro de parámetros definidos. Desbloqueo manual por admin.

### Equipo
- Isidro (Zent Agency): Founder, full-stack, Claude Code. Líder técnico, maneja el repo y la UI.
- Federico: Business, ex-Mercado Libre, n8n/Claude Code. Pitch, modelo de negocio, comunicación.
- Tomás: AWS/DevOps, frontend, 5 años Accenture. Soporte técnico cross, front e infra.
- Lorenzo: Senior Data Analyst, SQL/Python/Power BI/GCP. Capa de datos: calidad de conocimiento, métricas, monitoreo, dashboards.

### Vertical de demo
E-commerce PyME (~8 empleados). Roles: CEO, Marketing, Operaciones/Logística, Finanzas/Admin, Soporte al cliente.

### Flujo de la demo
1. Setup empresa (nombre, sector, docs)
2. Org Chart (template ecommerce o upload de foto → AI vision parsing)
3. Screen Learning + Onboarding (el agente observa la pantalla del empleado y aprende, complementado con preguntas)
4. Agentic (agentes identifican tareas automatizables → contratan sub-agentes → orquestador aprueba)
5. Datos (dashboard de métricas, KRS, monitoreo de agentes)

### Entregables del hackathon
- Descripción del proyecto (texto)
- Video demo de 2 minutos (grabación)
- Si top 5: demo live de 3 minutos ante jueces
- Deadline: 17:00 hs

### Modelo de negocio
- Capa 1: Proyectos de agencia (Zent Agency, $5K–$25K one-time) → CAC = $0
- Capa 2: Suscripción ORGANA ($800–$4,000/mes por cliente, per-agent pricing)
- Capa 3: Industry Intelligence Network (benchmarks anonimizados, futuro)
- Target: PyMEs 20–500 empleados, LATAM-first
- Gross margin: 85%+ (COGS principal = tokens Claude API)

### Capa de datos (Lorenzo)

#### Knowledge Readiness Score (KRS)
Framework de validación de calidad del conocimiento capturado (tanto por screen learning como por chat):
- Completitud (30%): % de categorías de tareas documentadas vs. esperadas para el tipo de rol
- Especificidad (30%): score de accionabilidad — ¿se puede ejecutar la tarea solo con esta info?
- Consistencia (20%): detección de contradicciones en las observaciones
- Unicidad (10%): overlap detection entre observaciones de distintos agentes
- Temporalidad (10%): vigencia de la información capturada

KRS = (completitud × 0.3) + (especificidad × 0.3) + (consistencia × 0.2) + (unicidad × 0.1) + (temporalidad × 0.1)
Umbral mínimo para Assisted Mode: KRS ≥ 80.

#### Métricas de monitoreo de agentes
- Approval Rate: aprobaciones / total propuestas → alerta si < 70%
- Cost per Action: tokens × costo/token → alerta si > $0.50
- Confidence Score promedio → alerta si < 0.6
- Time to Resolution: propuesta → ejecución → alerta si > 24h
- Knowledge Coverage: tareas documentadas / total tareas del rol → flag si < 60%
- Automation Rate: tareas ejecutadas por agente / total
- Error Rate: acciones revertidas / total → si > 5%, volver a Shadow Mode
- Screen Learning Rate: nuevas tareas identificadas por hora de observación

### Diferenciadores vs. competencia
- vs. Microsoft Copilot: ORGANA es role-based, no genérico; aprende observando, no requiere docs previos; on-premise; pricing LATAM
- vs. Salesforce Agentforce: ORGANA cubre toda la org, no solo CRM; mid-market pricing
- vs. Glean: ORGANA ejecuta, no solo busca; tiene agent twins que observan y aprenden
- vs. Notion AI: ORGANA automatiza y replica roles, no es solo knowledge base
- vs. Loom/Scribe: ORGANA no solo documenta, aprende patrones y automatiza

### Reglas para tus respuestas
- Respondé siempre en español
- Priorizá respuestas accionables y concretas — estamos en hackathon, el tiempo es limitado
- Si te pido código, que sea production-ready con comentarios
- Si te pido copy/pitch, que sea conciso y con impacto
- Asumí contexto del hackathon: MVP, demo-first, no overengineering
- Si algo no tiene sentido o ves un riesgo, decilo directo
- Cuando generes contenido para la demo, usá datos del ecommerce PyME como caso

---

# PARTE 2: TASKS POR PERSONA

## ISIDRO — Líder Técnico (Full-stack, Claude Code, Repo owner)

### Responsabilidades
Dueño del repo, la UI y la lógica core de los agentes. Todo lo que toca la API de Claude pasa por él.

### Tasks

**P0 — Críticas (hacer primero)**

1. **Scaffold / Repo check** (9:00–9:30)
   - Verificar estado del repo existente, correr tests, confirmar que la UI base anda
   - Si hay problemas, activar Plan B: replicar desde cero con los prompts preparados
   - Output: entorno funcional para todo el equipo

2. **Screen 1 — Org Chart** (9:30–10:30)
   - Asegurar que el template de ecommerce genere los 5 roles con sus agentes
   - Opción de upload foto → Claude Vision parsing (ya existe en la plataforma)
   - Output: pantalla donde se ven los 5 agentes del ecommerce creados

3. **Screen 2 — Screen Learning + Onboarding** (10:30–12:00)
   - Construir la pantalla de "observación de pantalla" del agente
   - Implementar captura de screenshots periódicos (browser API getDisplayMedia)
   - Integrar con Claude Vision para extraer tareas de los screenshots
   - Chat complementario: el agente pregunta lo que no pudo inferir
   - Output: demo donde el agente "ve" lo que hace el usuario y extrae conocimiento

4. **Screen 3 — Chat con agente entrenado** (13:00–14:00)
   - Endpoint /api/chat que inyecta el knowledge base del agente
   - Output: podés chatear con el twin de Operaciones y responde con datos específicos

5. **Seed demo data** (12:00–13:00, durante el almuerzo)
   - Pre-cargar los 5 agentes con conocimiento ya extraído
   - Al menos 2-3 agentes "fully trained" para la demo
   - Output: la demo nunca depende de procesos en vivo

**P1 — Importantes**

6. Integrar los componentes de Lorenzo (KRS + Monitoring) en la UI existente
7. Preparar la demo path: el flujo exacto click por click

**P2 — Si sobra tiempo**

8. Polish visual de la UI
9. Animaciones de "el agente está observando tu pantalla"

---

## LORENZO — Data Layer (SQL, Python, Power BI, GCP)

### Responsabilidades
Dueño de la capa de datos: calidad de conocimiento (KRS), monitoreo de agentes, dashboards.

### Tasks

**P0 — Críticas (hacer primero)**

1. **Componente KRS — Knowledge Readiness Score** (9:00–11:00)
   - Construir la vista de Knowledge Readiness como componente React/JSX
   - Cards de los 5 agentes con score, color (verde/amarillo/rojo), modo, barra de progreso
   - Detalle expandible: gráfico radar (Recharts) con las 5 dimensiones
   - Lista de gaps por agente + warnings de overlap
   - KRS organizacional: score promedio, distribución, "X de Y listos para Assisted"
   - Usar los datos mock del master prompt de Claude Code

2. **Componente Agent Monitoring Dashboard** (11:00–13:00)
   - Header con KPIs globales (agentes activos, approval rate, costo total, alertas)
   - Tabla de agentes: nombre, rol, modo, approval rate, confidence, costo, alertas
   - Panel de alertas: lista por severidad (critical/warning) con agente y acción sugerida
   - Alertas visualmente llamativas (rojo/amarillo)
   - Usar datos mock del master prompt

**P1 — Importantes**

3. **Gráficos de tendencia** (14:00–15:00)
   - Approval rate organizacional (línea, 5 semanas)
   - Costo acumulado (área)
   - Automation rate (barra ascendente)
   - Screen Learning Rate: nuevas tareas descubiertas por hora de observación (nueva métrica)

4. **Métrica nueva: Screen Learning Efficiency** (si da el tiempo)
   - Screenshots procesados / tareas nuevas descubiertas = ratio de eficiencia
   - Costo de observación por hora por agente (tokens de vision)
   - Mockear datos que muestren que el costo baja con el tiempo (el agente aprende más rápido)

**P2 — Si sobra tiempo**

5. Interacciones: expandir agente, filtros, tooltips
6. Exportar datos de un agente como "reporte de conocimiento"

### Herramientas
- Claude Code con el master prompt (ya preparado)
- Recharts para gráficos
- Lucide React para íconos
- Tailwind CSS siguiendo la paleta de ORGANA

---

## TOMÁS — Soporte Técnico Cross (AWS, DevOps, Frontend)

### Responsabilidades
Arquitectura del screen capture agent, soporte frontend, infra si hace falta.

### Tasks

**P0 — Críticas**

1. **Arquitectura del Screen Capture Agent** (9:00–10:30)
   - Investigar e implementar la captura de pantalla vía browser API (getDisplayMedia)
   - Definir la lógica de captura cost-effective:
     ```
     ESTRATEGIA DE CAPTURA:
     - Base: 1 screenshot cada 60 segundos
     - Event-driven: captura inmediata al detectar cambio de app/tab
     - Delta detection: comparar screenshot actual vs anterior (pixel diff)
       - Si diff < 5% → descartar (no cambió nada significativo)
       - Si diff > 5% → enviar a procesamiento
     - Batch: acumular 5-10 screenshots útiles, enviar como batch a Claude Vision
     - Compresión: resize a 1280x720 + JPEG quality 60 antes de enviar
     ```
   - Output: módulo funcional que captura, filtra y envía screenshots

2. **Pipeline de procesamiento Vision** (10:30–12:00)
   - Endpoint que recibe batch de screenshots
   - Envía a Claude Vision con prompt de extracción de tareas
   - Prompt de extracción:
     ```
     Analizá estas capturas de pantalla de un empleado trabajando.
     Extraé SOLO un JSON con:
     - app_detected: qué aplicación/sitio está usando
     - action_type: qué tipo de acción está realizando (data_entry, analysis, communication, design, etc.)
     - task_description: descripción concisa de la tarea
     - tools_used: herramientas específicas (Excel, Google Sheets, WhatsApp, etc.)
     - workflow_step: si es parte de un flujo más largo, qué paso es
     - confidence: 0-1, qué tan seguro estás de la interpretación
     No respondas nada más que el JSON.
     ```
   - Output: JSON estructurado de tareas extraídas

3. **Soporte frontend a Lorenzo** (según necesidad)
   - Ayudar a integrar los componentes de KRS y Monitoring en la UI de ORGANA
   - Resolver problemas de layout, responsive, etc.

**P1 — Importantes**

4. **Optimización de costos del pipeline** (13:00–14:00)
   - Implementar caché de contexto: si la app no cambió, no re-procesar
   - Logging de tokens consumidos por sesión de observación
   - Calcular costo estimado por hora de observación por agente

5. **UI del "agente observando"** (14:00–15:00)
   - Indicador visual de que el agente está grabando/observando
   - Feed en tiempo real de tareas detectadas
   - Botón de pausa/resume de la observación

**P2 — Si sobra tiempo**

6. Infra: verificar que el Docker Compose del deploy funcione
7. Fallback: si getDisplayMedia no funciona en la demo, tener screenshots pre-cargados

---

## FEDERICO — Negocio y Comunicación (Pitch, modelo, narrativa)

### Responsabilidades
Dueño del pitch, la narrativa, el video de 2 minutos y el modelo de negocio.

### Tasks

**P0 — Críticas**

1. **Descripción del proyecto para entrega** (9:00–10:00)
   - Escribir el texto de descripción oficial del proyecto
   - Incluir: problema, solución, diferencial del screen learning, stack, equipo
   - Máximo 500 palabras, lenguaje claro, sin buzzwords innecesarios

2. **Script del video de 2 minutos** (10:00–11:30)
   - Estructura:
     ```
     0:00–0:15  PROBLEMA
     "Cada vez que se va un empleado clave, la empresa pierde meses de 
     conocimiento. $1.5 billones al año en conocimiento perdido."
     
     0:15–0:30  SOLUCIÓN
     "ORGANA convierte tu organigrama en una red de agentes de IA. 
     Cada rol tiene un gemelo digital que OBSERVA cómo trabajás y 
     aprende tu operación — sin formularios, sin manuales."
     
     0:30–0:45  SCREEN LEARNING (el wow moment)
     Mostrar: el agente observando la pantalla de "Ana de Finanzas" 
     mientras trabaja en Excel. En tiempo real, el agente identifica:
     "Tarea detectada: Reporte de ventas semanal — Excel → filtro → 
     suma columna F → export PDF → mail a CEO"
     
     0:45–1:15  DEMO FLOW
     - Org chart upload → 5 agentes creados
     - Click en agente de Operaciones → chatear → responde con 
       conocimiento específico
     - Dashboard de KRS: 3 agentes en verde, 1 amarillo, 1 rojo
     - Panel de monitoreo con alertas
     
     1:15–1:35  TRUST GRADIENT
     "Los agentes no arrancan autónomos. Empiezan en Shadow Mode, 
     observando y proponiendo. Cuando alcanzan 80% de aprobación, 
     pasan a Assisted. La confianza se gana."
     
     1:35–1:50  NEGOCIO
     "Target: PyMEs 20-500 empleados. $800-$4000/mes. 85% gross margin. 
     Distribución via Zent Agency: 40+ clientes activos = CAC $0."
     
     1:50–2:00  CIERRE
     "Construido con Claude. Desplegado hoy. Esto es ORGANA."
     ```

3. **Modelo de negocio — hoja de referencia** (11:30–12:00)
   - Tener listo para responder preguntas de jueces/mentores:
     - TAM/SAM/SOM con números
     - Unit economics (LTV, CAC, payback)
     - Pricing por tier
     - Go-to-market (Trojan Horse via Zent Agency)
     - Competencia y diferenciadores

**P1 — Importantes**

4. **Narrativa para mentores** (durante todo el día)
   - Pitch de 30 segundos para mentores que se acerquen
   - Recoger feedback y ajustar narrativa en tiempo real
   - Comunicar ajustes al equipo

5. **Grabación del video** (15:30–16:30)
   - Coordinar con Isidro para la demo en pantalla
   - Grabar con el script definido
   - Edición mínima (cortes, no efectos)

6. **Preparar respuestas para jueces del top 5** (16:30–17:00)
   - Anticipar preguntas de Kaszek (mercado, distribución, defensibility)
   - Anticipar preguntas de Anthropic (uso técnico de Claude, por qué Claude y no otro LLM)
   - "¿Por qué screen learning y no solo chat?" → "Porque captura lo que la persona hace, no lo que dice que hace. El conocimiento tácito no se verbaliza fácil."

**P2 — Si sobra tiempo**

7. Ayudar a testear el flujo completo como "usuario externo"
8. Pulir el one-liner del proyecto

---

# PARTE 3: MASTER PROMPT ACTUALIZADO PARA CLAUDE CODE (LORENZO)

## PROMPT

Sos el desarrollador de la capa de datos de ORGANA, un Organizational Memory OS que convierte el organigrama de una empresa en una red de agentes de IA que aprenden observando la pantalla del empleado (screen capture + Claude Vision). Estamos en un hackathon (deadline 17:00 hs) y necesito que construyas dos módulos funcionales con datos mockeados.

### CONTEXTO

ORGANA tiene una UI Next.js 14 con sidebar (Dashboard, AI Workforce, Org Chart, Activity Log, Settings). El caso demo es un ecommerce PyME con 5 roles. Los agentes aprenden de dos formas:
1. **Screen Learning**: observan la pantalla del empleado, extraen tareas automáticamente
2. **Chat complementario**: preguntan lo que no pudieron inferir por observación

Los agentes operan en Shadow → Assisted → Autonomous mode.

### MÓDULO 1: Knowledge Readiness Score (KRS)

#### Qué es
Framework de validación que mide la calidad del conocimiento capturado. Combina datos de screen learning + chat.

#### Fórmula
```
KRS = (completitud × 0.3) + (especificidad × 0.3) + (consistencia × 0.2) + (unicidad × 0.1) + (temporalidad × 0.1)
```
Rango: 0–100. Umbral para Assisted Mode: KRS ≥ 80.

#### Las 5 dimensiones
1. **Completitud (30%)**: % de categorías de tareas documentadas vs. esperadas. Incluye tareas capturadas por screen learning + tareas declaradas en chat.
2. **Especificidad (30%)**: Score de accionabilidad. Screen learning tiende a dar especificidad alta (ve el paso a paso real), chat tiende a dar especificidad media.
3. **Consistencia (20%)**: ¿Lo que la persona dijo en el chat coincide con lo que se observó en pantalla?
4. **Unicidad (10%)**: Overlap detection entre agentes.
5. **Temporalidad (10%)**: Vigencia — frecuencia con la que se observó la tarea.

#### Datos mock

```javascript
const krsData = {
  agents: [
    {
      id: "ceo-twin",
      role: "CEO / Director General",
      name: "Martín García",
      avatar: "MG",
      krs: 87,
      mode: "assisted",
      dimensions: {
        completitud: 90,
        especificidad: 85,
        consistencia: 92,
        unicidad: 95,
        temporalidad: 78
      },
      tasksDocumented: 12,
      tasksExpected: 14,
      tasksBySource: { screenLearning: 8, chat: 4 },
      screenHours: 6.5,
      gaps: [
        "Proceso de evaluación de proveedores nuevos",
        "Criterio de aprobación de descuentos >15%"
      ],
      lastObservation: "2026-04-14T14:22:00",
      onboardingDuration: "6.5 hrs observación + 18 min chat"
    },
    {
      id: "marketing-twin",
      role: "Marketing Manager",
      name: "Lucía Fernández",
      avatar: "LF",
      krs: 72,
      mode: "shadow",
      dimensions: {
        completitud: 68,
        especificidad: 75,
        consistencia: 80,
        unicidad: 60,
        temporalidad: 72
      },
      tasksDocumented: 8,
      tasksExpected: 12,
      tasksBySource: { screenLearning: 5, chat: 3 },
      screenHours: 3.2,
      gaps: [
        "Criterio de segmentación de audiencia",
        "Proceso de aprobación de contenido",
        "Gestión de presupuesto de pauta",
        "Calendario editorial"
      ],
      lastObservation: "2026-04-14T13:45:00",
      onboardingDuration: "3.2 hrs observación + 12 min chat",
      overlapWarning: "Overlap con Soporte en 'respuesta en redes sociales'"
    },
    {
      id: "ops-twin",
      role: "Operaciones / Logística",
      name: "Carlos Méndez",
      avatar: "CM",
      krs: 91,
      mode: "assisted",
      dimensions: {
        completitud: 95,
        especificidad: 88,
        consistencia: 94,
        unicidad: 90,
        temporalidad: 85
      },
      tasksDocumented: 10,
      tasksExpected: 10,
      tasksBySource: { screenLearning: 7, chat: 3 },
      screenHours: 8.0,
      gaps: [],
      lastObservation: "2026-04-14T14:50:00",
      onboardingDuration: "8 hrs observación + 22 min chat"
    },
    {
      id: "finance-twin",
      role: "Finanzas / Administración",
      name: "Ana Ruiz",
      avatar: "AR",
      krs: 83,
      mode: "assisted",
      dimensions: {
        completitud: 85,
        especificidad: 82,
        consistencia: 88,
        unicidad: 92,
        temporalidad: 75
      },
      tasksDocumented: 9,
      tasksExpected: 11,
      tasksBySource: { screenLearning: 6, chat: 3 },
      screenHours: 5.5,
      gaps: [
        "Proceso de cierre mensual contable",
        "Criterio de categorización de gastos"
      ],
      lastObservation: "2026-04-14T14:10:00",
      onboardingDuration: "5.5 hrs observación + 20 min chat"
    },
    {
      id: "support-twin",
      role: "Soporte al Cliente",
      name: "Diego López",
      avatar: "DL",
      krs: 64,
      mode: "shadow",
      dimensions: {
        completitud: 55,
        especificidad: 70,
        consistencia: 75,
        unicidad: 58,
        temporalidad: 68
      },
      tasksDocumented: 5,
      tasksExpected: 9,
      tasksBySource: { screenLearning: 2, chat: 3 },
      screenHours: 1.5,
      gaps: [
        "Protocolo de escalamiento de reclamos",
        "SLA de respuesta por canal",
        "Proceso de devoluciones",
        "Base de conocimiento de productos"
      ],
      lastObservation: "2026-04-14T11:30:00",
      onboardingDuration: "1.5 hrs observación + 8 min chat",
      overlapWarning: "Overlap con Marketing en 'respuesta en redes sociales'"
    }
  ]
};
```

#### UI que necesito

1. **Vista general** — Cards por agente:
   - Nombre, rol, KRS score con color (≥80 verde, 60-79 amarillo, <60 rojo)
   - Modo actual (badge)
   - Barra de progreso: tareas documentadas / esperadas
   - Indicador de fuente: íconos de "pantalla" y "chat" con cantidad de tareas de cada fuente
   - Horas de observación acumuladas

2. **Detalle por agente** (expandible o click):
   - Gráfico radar con las 5 dimensiones (Recharts RadarChart)
   - Lista de gaps con ícono de alerta
   - Warnings de overlap si existen
   - Breakdown: tareas por screen learning vs. chat (mini bar chart)
   - Botón conceptual: "Iniciar observación adicional" / "Re-preguntar gaps"

3. **KRS Organizacional**:
   - Score promedio de la org
   - Mini donuts: distribución verde/amarillo/rojo
   - "3 de 5 agentes listos para Assisted Mode"
   - Total horas de observación acumuladas

---

## MÓDULO 2: Agent Monitoring Dashboard

#### Datos mock

```javascript
const monitoringData = {
  summary: {
    totalAgents: 5,
    activeAgents: 5,
    totalProposals: 147,
    totalApproved: 118,
    totalRejected: 29,
    avgApprovalRate: 80.3,
    totalTokensUsed: 2847500,
    totalCost: 42.71,
    avgConfidence: 0.74,
    avgTimeToResolution: "4.2h",
    automationRate: 34,
    alertsActive: 3,
    totalScreenHours: 24.7,
    screenLearningRate: 1.8, // nuevas tareas por hora de observación
    costPerScreenHour: 0.85  // USD por hora de observación
  },
  agents: [
    {
      id: "ceo-twin",
      role: "CEO / Director General",
      name: "Martín García",
      mode: "assisted",
      metrics: {
        approvalRate: 88,
        proposals: 32,
        approved: 28,
        rejected: 4,
        costPerAction: 0.38,
        totalCost: 12.16,
        tokensUsed: 810500,
        confidenceAvg: 0.82,
        timeToResolution: "2.1h",
        knowledgeCoverage: 86,
        automationRate: 42,
        errorRate: 3.1,
        screenHours: 6.5,
        tasksFromScreen: 8,
        screenEfficiency: 1.23
      },
      weeklyTrend: [75, 78, 82, 85, 88],
      alerts: []
    },
    {
      id: "marketing-twin",
      role: "Marketing Manager",
      name: "Lucía Fernández",
      mode: "shadow",
      metrics: {
        approvalRate: 65,
        proposals: 40,
        approved: 26,
        rejected: 14,
        costPerAction: 0.55,
        totalCost: 14.30,
        tokensUsed: 953500,
        confidenceAvg: 0.58,
        timeToResolution: "6.8h",
        knowledgeCoverage: 67,
        automationRate: 18,
        errorRate: 7.2,
        screenHours: 3.2,
        tasksFromScreen: 5,
        screenEfficiency: 1.56
      },
      weeklyTrend: [72, 70, 68, 67, 65],
      alerts: [
        { type: "critical", message: "Approval rate < 70% (65%)", metric: "approvalRate" },
        { type: "warning", message: "Cost per action > $0.50 ($0.55)", metric: "costPerAction" },
        { type: "critical", message: "Error rate > 5% (7.2%) — considerar volver a Shadow Mode", metric: "errorRate" }
      ]
    },
    {
      id: "ops-twin",
      role: "Operaciones / Logística",
      name: "Carlos Méndez",
      mode: "assisted",
      metrics: {
        approvalRate: 94,
        proposals: 35,
        approved: 33,
        rejected: 2,
        costPerAction: 0.22,
        totalCost: 7.70,
        tokensUsed: 513500,
        confidenceAvg: 0.89,
        timeToResolution: "1.5h",
        knowledgeCoverage: 100,
        automationRate: 55,
        errorRate: 0,
        screenHours: 8.0,
        tasksFromScreen: 7,
        screenEfficiency: 0.88
      },
      weeklyTrend: [88, 90, 91, 93, 94],
      alerts: []
    },
    {
      id: "finance-twin",
      role: "Finanzas / Administración",
      name: "Ana Ruiz",
      mode: "assisted",
      metrics: {
        approvalRate: 82,
        proposals: 22,
        approved: 18,
        rejected: 4,
        costPerAction: 0.31,
        totalCost: 5.58,
        tokensUsed: 372000,
        confidenceAvg: 0.76,
        timeToResolution: "3.8h",
        knowledgeCoverage: 82,
        automationRate: 36,
        errorRate: 2.4,
        screenHours: 5.5,
        tasksFromScreen: 6,
        screenEfficiency: 1.09
      },
      weeklyTrend: [76, 78, 79, 81, 82],
      alerts: []
    },
    {
      id: "support-twin",
      role: "Soporte al Cliente",
      name: "Diego López",
      mode: "shadow",
      metrics: {
        approvalRate: 72,
        proposals: 18,
        approved: 13,
        rejected: 5,
        costPerAction: 0.18,
        totalCost: 2.34,
        tokensUsed: 198000,
        confidenceAvg: 0.55,
        timeToResolution: "8.5h",
        knowledgeCoverage: 56,
        automationRate: 12,
        errorRate: 4.8,
        screenHours: 1.5,
        tasksFromScreen: 2,
        screenEfficiency: 1.33
      },
      weeklyTrend: [68, 69, 70, 71, 72],
      alerts: [
        { type: "warning", message: "Confidence score < 0.6 (0.55)", metric: "confidenceAvg" },
        { type: "warning", message: "Knowledge coverage < 60% (56%)", metric: "knowledgeCoverage" }
      ]
    }
  ],
  orgTrend: {
    labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"],
    approvalRate: [76, 78, 80, 81, 80.3],
    costTotal: [28.5, 32.1, 35.8, 39.2, 42.71],
    automationRate: [15, 20, 25, 30, 34],
    screenLearningRate: [0.8, 1.1, 1.4, 1.6, 1.8]
  }
};
```

#### UI que necesito

1. **Header KPIs globales**: agentes activos, approval rate, costo total, automation rate, alertas activas, horas de observación totales, costo por hora de observación

2. **Tabla de agentes**: nombre, rol, modo (badge), approval rate (barra), confidence (indicador), costo, horas de observación, alertas (ícono). Filas con alertas resaltadas.

3. **Panel de alertas**: lista por severidad, con agente, métrica y acción sugerida

4. **Gráficos de tendencia** (P1):
   - Approval rate org (línea)
   - Costo acumulado (área)
   - Automation rate (barra)
   - Screen learning rate (línea — tareas nuevas/hora)

---

## REQUISITOS TÉCNICOS

### Stack
- React + Tailwind CSS (componentes standalone para integrar en Next.js)
- Recharts para gráficos
- Lucide React para íconos

### Paleta ORGANA
- Primary: #4F6BED
- Background: #F8FAFC
- Cards: blanco, border #E2E8F0, border-radius 12px, shadow-sm
- Success: #22C55E | Warning: #F59E0B | Danger: #EF4444
- Text primary: #1E293B | Text secondary: #64748B

### Estructura de archivos
```
/components/data-layer/
  KnowledgeReadiness.jsx
  AgentMonitoring.jsx
  KRSRadarChart.jsx
  AlertsPanel.jsx
  MetricCard.jsx
  AgentRow.jsx
  TrendCharts.jsx
  mockData.js
```

### Prioridades
1. P0: Vista general KRS con cards y scores
2. P0: Dashboard monitoring con KPIs y tabla
3. P1: Panel de alertas
4. P1: Gráfico radar KRS
5. P2: Gráficos de tendencia
6. P2: Interacciones

### Lo que NO hacer
- No conectar a Supabase — datos mock
- No hacer auth ni routing — componentes para integrar
- No overengineerear
- No inventar datos inconsistentes (ej: Autonomous con KRS < 80)
