// src/lib/demo-seed.ts
// Loads Nova Store demo data into localStorage.
// Call loadDemoData() client-side when no agents exist.

import { agentStore } from './agent-store'
import { NOVA_STORE_DEMO } from '../../tools/scripts/seed-demo'

export function loadDemoData(): boolean {
  try {
    agentStore.seedDemoCompany(NOVA_STORE_DEMO)
    return true
  } catch {
    return false
  }
}
