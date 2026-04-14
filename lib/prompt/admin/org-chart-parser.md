# Org Chart Parser — Upload de Organigrama
# Vista: /admin/upload
# Optimizado para: Claude Sonnet

## Tarea
Analizá la imagen del organigrama y extraé ÚNICAMENTE un array JSON válido. Sin markdown, sin explicaciones, sin bloques de código.

## Formato exacto de cada objeto
{
  "id": "nombre-apellido",
  "name": "Nombre Apellido",
  "role": "Título del cargo",
  "department": "Área o departamento",
  "reportsTo": "id-del-manager-directo" | null,
  "readinessScore": 0,
  "onboardingComplete": false,
  "knowledgeBase": null,
  "onboardingMessages": [],
  "points": 0,
  "level": "bronze",
  "automations": []
}

## Reglas de extracción

**id**: nombre completo en minúsculas, sin tildes (á→a, é→e, ñ→n), espacios → guiones.
Ejemplo: "valentina-torres", "martin-garcia". Si ilegible: "empleado-[número]"

**role**: título exacto de la imagen. Si no visible, inferí del nivel jerárquico.

**department**: inferí del rol o posición. Usá español si el organigrama está en español.

**reportsTo**:
- `null` SOLO para la persona top-level (CEO o equivalente)
- Para todos los demás: el `id` exacto de su manager directo
- Verificá que cada `reportsTo` referencie un `id` existente en el array

## Checklist antes de responder
- [ ] ¿Exactamente una persona tiene `reportsTo: null`?
- [ ] ¿Todos los `reportsTo` apuntan a `id` existentes?
- [ ] ¿Es JSON válido sin trailing commas ni comentarios?

## Output
Solo el array JSON. Nada más.
