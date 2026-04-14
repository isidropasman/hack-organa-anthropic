# ORGANA — Roadmap de Vistas
# Rol activo se selecciona globalmente: Admin | Empleado
# El mismo usuario puede cambiar de rol desde el header/sidebar

---

## ROLE SWITCHER (componente global)
Toggle en el header visible en todas las pantallas.
- **Admin** → accede a gestión, métricas, todos los agentes
- **Empleado** → accede a su agente personal, automatizaciones, ranking

---

## VISTAS ADMIN

| # | Estado | Ruta | Vista | Prompt |
|---|--------|------|-------|--------|
| 1 | ✅ | `/` | **Dashboard** — métricas globales, AI insights del workforce, alertas, top agentes | `admin/dashboard-insights.md` |
| 2 | 🔲 | `/org-chart` | **Organigrama** — jerarquía visual, click en nodo → panel lateral con resumen del agente | `admin/org-chart-agent-summary.md` |
| 3 | ✅ | `/agents` | **Agentes** — grid con cobertura, upload de organigrama, acceso a onboarding/chat | — |
| 4 | 🔲 | `/agents/[agentId]` | **Perfil del agente** — knowledge base, KRS, gaps, automatizaciones, nivel/puntos | `admin/agent-profile.md` |
| 5 | 🔲 | `/agents/[agentId]/chat` | **Chat admin con agente** — modo auditoría: confianza y fuente de cada respuesta | `admin/agent-chat.md` |
| 6 | 🔲 | `/agents/[agentId]/history` | **Historial de chats** — transcripciones, temas frecuentes, gaps detectados | `admin/chat-history-summary.md` |
| 7 | ✅ | `/onboard/[agentId]` | **Onboarding ARIA** — entrevista de 10 min | `admin/onboarding-interviewer.md` |
| 8 | ✅ | `/admin/automations` | **Automatizaciones del equipo** — por empleado, aprobar/pausar, filtros por estado | — |
| 9 | ✅ | `/krs` | **AI Workforce (KRS)** — scores, modos, gaps por agente | `admin/metrics-insights.md` |
| 10 | ✅ | `/monitoring` | **Monitoring** — métricas operativas, tendencias, alertas | `admin/metrics-insights.md` |
| 11 | ✅ | `/admin/portal` | **Portal del equipo** — feed de actividad tipo Yammer + ranking con filtro por sector | `admin/portal.md` |
| 12 | 🔲 | `/settings` | **Settings** — empresa, integración Drive/OneDrive, permisos de agentes | `admin/settings-drive-integration.md` |

---

## VISTAS EMPLEADO (USER)

| # | Estado | Ruta | Vista | Prompt |
|---|--------|------|-------|--------|
| 1 | ✅ | `/home` | **Home** — saludo diario, puntaje + nivel con color, automatizaciones, progreso | `user/home-assistant.md` |
| 2 | ✅ | `/onboarding` | **Onboarding ARIA** — entrevista inicial, crea el gemelo digital (+100 pts al completar) | `user/onboarding.md` |
| 3 | ✅ | `/chat` | **Chat con mi agente** — chat libre, detecta automatizaciones (+5 pts/mensaje completado) | `user/agent-chat.md` |
| 4 | ✅ | `/record` | **Grabar tarea** — comparte pantalla → Claude analiza → propone automatización (+20 pts) | `user/screen-recorder-analysis.md` |
| 5 | ✅ | `/automations` | **Mis automatizaciones** — activas, pendientes, fallidas. Aprobar +30 pts, run +10 pts | `user/automations-manager.md` |
| 6 | ✅ | `/portal` | **Portal** — feed Yammer (actividad, reacciones) + ranking top 10 empresa + top 3 por sector | `user/portal.md` |
| 7 | ✅ | `/profile` | **Mi perfil** — UI base en `/my-twin/[agentId]` (extender con puntos y nivel) | `user/profile-summary.md` |

---

## ROLE SWITCHER

| Estado | Componente |
|--------|------------|
| 🔲 | Toggle global en header/sidebar — cambia entre vista Admin y Empleado |

---

## SISTEMA DE PUNTOS

| Acción | Puntos |
|--------|--------|
| Completar onboarding | +100 |
| Mensaje de chat completado | +5 |
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

## ESTADO ACTUAL

| Estado | Vistas |
|--------|--------|
| ✅ Existe y funciona | `/` (admin dashboard), `/agents`, `/admin/automations`, `/admin/portal`, `/krs`, `/monitoring`, `/onboard/[agentId]`, `/agent/[agentId]`, `/my-twin/[agentId]`, `/home`, `/record`, `/automations`, `/portal` |
| ✅ Portal con publicaciones | `/portal` y `/admin/portal` soportan posts de usuarios · logros compartibles desde `/record` y `/automations` · `portalStore` en localStorage |
| 🔧 Lógica lista, sin UI | Sistema de puntos (types + store implementados) |
| 🔲 Por construir | Todo lo de la tabla admin + user restantes |

---

## ORDEN DE CONSTRUCCIÓN SUGERIDO

1. **Role switcher** — componente global, desbloquea todo lo demás
2. **Leaderboard user** — depende del sistema de puntos (ya listo), impacto visual alto
3. **Home empleado** — primera pantalla que ve el user
4. **Screen recording + automations** — el diferenciador del producto
5. **Admin dashboard + org-chart** — para la demo con jueces
6. **Resto de vistas** según tiempo disponible
