import { seedState } from "./seed";
import type { InventoryState } from "./types";
import { recalculateAlerts } from "./inventoryEngine";

const STORAGE_KEY = "nucleo-inventario-state-v1";
let memoryState: InventoryState | null = null;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function loadState(): InventoryState {
  if (memoryState) return clone(memoryState);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    memoryState = recalculateHydrated(JSON.parse(raw));
  } else {
    memoryState = recalculateHydrated(seedState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
  }
  return clone(memoryState);
}

function recalculateHydrated(state: InventoryState): InventoryState {
  return { ...state, alerts: recalculateAlerts({ ...state, alerts: state.alerts ?? [] }) };
}

export async function getState() {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return loadState();
}

export async function saveState(updater: (state: InventoryState) => InventoryState) {
  await new Promise((resolve) => setTimeout(resolve, 160));
  const next = updater(loadState());
  memoryState = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return clone(next);
}

export async function resetState() {
  memoryState = recalculateHydrated(seedState);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
  return clone(memoryState);
}
