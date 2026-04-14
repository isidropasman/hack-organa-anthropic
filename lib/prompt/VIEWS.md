# ORGANA — Mapa de Vistas
# Documento de referencia para todas las pantallas de la aplicación
# Última actualización: 2026-04-14

---

## LADO ADMIN

### `/` — Dashboard principal
Vista de entrada para el administrador. Cards de resumen: total de agentes, cobertura (%), automatizaciones activas / pendientes / fallidas, tiempo total ahorrado. Barra de cobertura por departamento, alertas críticas con link a `/admin/automations`, AI insight de Claude con estado del workforce. Columna derecha: top 5 agentes por puntos + lista de agentes sin entrenar + acciones rápidas.
- Prompt: `lib/prompt/admin/dashboard-insights.md`
- API: `/api/admin-insights`

---

### `/agents` — Agentes
Grid de todos los agentes con nombre, rol, departamento, estado de onboarding, nivel y puntos. Upload de imagen de org chart (Claude Vision extrae los agentes). Botón "Load Nova Agency Demo" para cargar datos de seed.
- Prompt de parsing: `lib/prompt/admin/org-chart-parser.md`
- API: `/api/parse-org`

---

### `/admin/automations` — Automatizaciones del equipo
Automatizaciones de todos los empleados clasificadas por sección acordeón (un accordeón por empleado). Mini-stats por empleado: activas, pendientes, fallidas, tiempo ahorrado. El admin puede aprobar / pausar / reanudar automatizaciones individuales. Tabs de filtro por estado con conteos globales. 6 metric cards de resumen arriba.

---

### `/admin/portal` — Portal del equipo
Dos tabs: **Feed** y **Ranking**.

**Feed:** actividad reciente del equipo (onboardings completados, automatizaciones activadas, grabaciones, hitos del sistema) + publicaciones de empleados (tipo Yammer, incluyendo logros compartidos). Filtros: Todo / Publicaciones / Logros / Automatizaciones / Grabaciones / Hitos. Strip de 4 stats arriba. AI insight de Claude ("Pulso de la comunidad").
- Prompt: `lib/prompt/admin/portal.md`
- API: `/api/admin-portal`

**Ranking:** tabla completa de todos los empleados con puntos, nivel, automatizaciones activas. Filtro por departamento (pills). Los empleados sin entrenar tienen badge "Sin entrenar" con link al onboarding.
- Prompt: `lib/prompt/admin/leaderboard-insights.md`
- API: `/api/admin-leaderboard`

---

### `/krs` — AI Workforce (KRS)
Scores de conocimiento por agente: coverage, confianza, gaps detectados, modos de operación.
- Prompt: `lib/prompt/admin/metrics-insights.md`

---

### `/monitoring` — Monitoreo
Métricas operativas: approval rates, costos por acción, confidence scores, error rates. Gráficos de tendencia semanal. AI insight de Claude con alertas y recomendaciones.
- Prompt: `lib/prompt/admin/metrics-insights.md`

---

### `/onboard/[agentId]` — Onboarding ARIA (Admin)
El admin puede iniciar o reiniciar la entrevista de onboarding para cualquier agente. ARIA conduce 12–18 intercambios cubriendo 6 categorías de conocimiento operativo.
- Prompt: `lib/prompt/admin/onboarding-interviewer.md`
- API: `/api/onboard`

---

### `/agent/[agentId]` — Chat con agente
Chat con el gemelo digital del empleado. Usa el knowledge base como contexto.
- Prompt: `lib/prompt/user/agent-chat.md`
- API: `/api/chat`

---

## LADO USUARIO (EMPLEADO)

### `/home` — Home del empleado
Vista principal. Cards: puntaje + nivel con color + barra de progreso al siguiente nivel, automatizaciones activas, tiempo ahorrado, posición en ranking. Saludo diario generado por Claude (2 líneas: motivación + acción concreta). Sección de automatizaciones pendientes y acceso rápido al chat.
- Prompt: `lib/prompt/user/home-assistant.md`
- API: `/api/home-message`

---

### `/onboarding` — Onboarding ARIA (Empleado)
Primera experiencia. ARIA entrevista al empleado para construir su gemelo digital. Al completar: +100 pts, el agente queda entrenado. Solo se realiza una vez (reiniciable por admin).
- Prompt: `lib/prompt/user/onboarding.md`
- API: `/api/onboard`

---

### `/chat` — Chat con mi agente
El empleado chatea con su gemelo digital usando el knowledge base. Cada mensaje completado suma +5 pts.
- Prompt: `lib/prompt/user/agent-chat.md`
- API: `/api/chat`

---

### `/record` — Grabar una tarea
El empleado comparte su pantalla y realiza una tarea. Claude analiza los frames capturados, detecta contenido sensible (bloquea análisis si encuentra mensajería personal, apps bancarias, datos de salud), identifica pasos, evalúa automatizabilidad y genera propuesta con nombre descriptivo. Grabar suma +20 pts. Al agregar la automatización (+30 pts), aparece el botón "Compartir logro en el portal" para publicar el logro en el feed.
- Prompt: `lib/prompt/user/screen-recorder-analysis.md`
- API: `/api/analyze-recording`

---

### `/automations` — Mis automatizaciones
Lista de automatizaciones del empleado agrupadas por estado: Fallidas → Pendientes → Activas → Aprendiendo → Pausadas. Cards con stats (ejecuciones, tiempo ahorrado, última ejecución, próxima). Acciones: aprobar (+30 pts), pausar, reanudar, eliminar. Las automatizaciones activas tienen botón "Compartir logro en el portal". Alerta de urgencia para fallidas y pendientes.
- Prompt: `lib/prompt/user/automations-manager.md`

---

### `/portal` — Portal
Dos tabs: **Feed** y **Ranking**.

**Feed:** composer de publicaciones (280 chars, selector de mood emoji, Ctrl+Enter para publicar) + actividad del equipo (onboardings, automatizaciones, grabaciones, hitos) + publicaciones de compañeros. Reacciones: 👏 🔥 ⚡. El usuario puede eliminar sus propias publicaciones. Los logros compartidos desde `/record` y `/automations` aparecen aquí con borde destacado. Mensaje diario de Claude arriba del feed.
- Prompt: `lib/prompt/user/portal.md`
- API: `/api/portal-message`

**Ranking:** Mi posición + Top 10 empresa + Top 3 por sector con niveles (Bronze/Silver/Gold/Elite) y colores.

---

### `/my-twin/[agentId]` — Mi perfil / Mi Twin
Vista del gemelo digital del empleado: knowledge base, automatizaciones, estadísticas de uso, nivel y puntos.
- Prompt: `lib/prompt/user/profile-summary.md`

---

## SISTEMA DE PUNTOS

| Acción | Puntos |
|--------|--------|
| Completar onboarding | +100 |
| Mensaje de chat con el agente | +5 |
| Grabar una tarea | +20 |
| Aprobar una automatización | +30 |
| Automatización ejecutada exitosamente | +10 |

| Nivel | Rango | Color |
|-------|-------|-------|
| 🟫 Bronze | 0–499 pts | `#CD7F32` |
| ⬜ Silver | 500–1.499 pts | `#C0C0C0` |
| 🟡 Gold | 1.500–3.999 pts | `#FFD700` |
| 🔵 Elite | 4.000+ pts | `#4F6BED` |

---

## ESTRUCTURA DE ARCHIVOS DE PROMPTS

```
lib/prompt/
├── VIEWS.md              ← este archivo
├── ROADMAP.md            ← estado de construcción
├── admin/
│   ├── dashboard-insights.md       → /  (AI insight del workforce)
│   ├── portal.md                   → /admin/portal (Feed — Pulso de la comunidad)
│   ├── leaderboard-insights.md     → /admin/portal (Ranking tab)
│   ├── metrics-insights.md         → /krs y /monitoring
│   ├── onboarding-interviewer.md   → /onboard/[agentId]
│   ├── org-chart-parser.md         → /agents (upload)
│   ├── org-chart-agent-summary.md  → /org-chart (pendiente)
│   ├── agent-profile.md            → /agents/[agentId] (pendiente)
│   ├── agent-chat.md               → /agents/[agentId]/chat (pendiente)
│   ├── chat-history-summary.md     → /agents/[agentId]/history (pendiente)
│   └── settings-drive-integration.md → /settings (pendiente)
└── user/
    ├── portal.md                   → /portal (Feed — digest diario)
    ├── leaderboard.md              → /portal (Ranking tab — mensaje motivacional)
    ├── home-assistant.md           → /home (saludo diario)
    ├── onboarding.md               → /onboarding
    ├── agent-chat.md               → /chat y /agent/[agentId]
    ├── screen-recorder-analysis.md → /record
    ├── automations-manager.md      → /automations
    └── profile-summary.md          → /my-twin/[agentId]
```
