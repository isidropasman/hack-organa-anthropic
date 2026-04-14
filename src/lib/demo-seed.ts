// src/lib/demo-seed.ts
// Loads Nova Agency demo data into localStorage.
// Call loadDemoData() client-side when no agents exist.

import { agentStore } from './agent-store'
import { NOVA_AGENCY_DEMO } from './demo-data'

export function loadDemoData(): boolean {
  try {
    agentStore.seedDemoCompany(NOVA_AGENCY_DEMO)
    return true
  } catch {
    return false
  }
}
