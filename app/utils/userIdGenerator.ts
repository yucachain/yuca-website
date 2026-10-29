/**
 * YucaChain User Identification System
 * 
 * ID Scheme:
 * - Farmer:           YC-FRM-0001, YC-FRM-0002, ...
 * - Buyer / Processor: YC-PRS-0001, YC-PRS-0002, ...
 * - Service Provider:  YC-SPR-0001, YC-SPR-0002, ...
 * - Consumer:          YC-CON-0001, YC-CON-0002, ...
 */

export type RoleIdPrefix = "YC-FRM" | "YC-PRS" | "YC-SPR" | "YC-CON";

const REGISTRY_STORAGE_KEY = "yuca_user_id_registry";
const COUNTER_STORAGE_KEY = "yuca_role_id_counters";

/**
 * Returns the standardized prefix for any given role string
 */
export function getRolePrefix(role?: string | null): RoleIdPrefix {
  if (!role) return "YC-CON";
  const lower = role.toLowerCase().trim();

  if (lower.includes("farm") || lower.includes("grower") || lower.includes("producer")) {
    return "YC-FRM";
  }
  if (
    lower.includes("process") ||
    lower.includes("buyer") ||
    lower.includes("mill") ||
    lower.includes("aggregat") ||
    lower.includes("off-taker")
  ) {
    return "YC-PRS";
  }
  if (
    lower.includes("service") ||
    lower.includes("isp") ||
    lower.includes("vault") ||
    lower.includes("operator") ||
    lower.includes("tractor") ||
    lower.includes("machin") ||
    lower.includes("logistic")
  ) {
    return "YC-SPR";
  }
  if (lower.includes("consum") || lower.includes("shop") || lower.includes("retail")) {
    return "YC-CON";
  }

  return "YC-CON";
}

/**
 * Formats a prefix and number into YC-XXX-0001
 */
export function formatSequentialId(prefix: RoleIdPrefix, sequence: number): string {
  const padded = String(Math.max(1, sequence)).padStart(4, "0");
  return `${prefix}-${padded}`;
}

import registeredLiveData from "../data/registered_live_data.json";

/**
 * In-memory fallback if localStorage is unavailable
 */
const inMemoryCounters: Record<RoleIdPrefix, number> = {
  "YC-FRM": (registeredLiveData as any)?.farmers?.length || 47,
  "YC-PRS": (registeredLiveData as any)?.processors?.length || 25,
  "YC-SPR": 0,
  "YC-CON": 0,
};

const seededRegistry: Record<string, string> = {
  ...((registeredLiveData as any)?.registry || {}),
  ...((registeredLiveData as any)?.idRegistry || {}),
};

const inMemoryRegistry: Record<string, string> = { ...seededRegistry };

function getCounters(): Record<RoleIdPrefix, number> {
  const baseCounters = { ...inMemoryCounters };
  if (typeof window === "undefined") return baseCounters;
  try {
    const raw = localStorage.getItem(COUNTER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        "YC-FRM": Math.max(baseCounters["YC-FRM"], parsed["YC-FRM"] || 0),
        "YC-PRS": Math.max(baseCounters["YC-PRS"], parsed["YC-PRS"] || 0),
        "YC-SPR": Math.max(baseCounters["YC-SPR"], parsed["YC-SPR"] || 0),
        "YC-CON": Math.max(baseCounters["YC-CON"], parsed["YC-CON"] || 0),
      };
    }
  } catch {}
  return baseCounters;
}

function saveCounters(counters: Record<RoleIdPrefix, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(counters));
  } catch {}
}

function getRegistry(): Record<string, string> {
  if (typeof window === "undefined") return inMemoryRegistry;
  try {
    const raw = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (raw) {
      return { ...seededRegistry, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...seededRegistry };
}

function saveRegistry(registry: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registry));
  } catch {}
}

/**
 * Normalizes identifier key for lookups
 */
function normalizeKey(identifier: string): string {
  return identifier.trim().toLowerCase();
}

/**
 * Checks if a string already looks like an assigned YC-XXX-0000 ID
 */
export function isAssignedUserId(val?: string | null): boolean {
  if (!val) return false;
  return /^YC-(FRM|PRS|SPR|CON)-\d{4,}$/i.test(val.trim());
}

/**
 * Allocates the next sequential ID for the given role and saves it for the identifier.
 */
export function allocateNextUserId(role: string, identifier?: string): string {
  const prefix = getRolePrefix(role);
  const counters = getCounters();
  const nextSeq = (counters[prefix] || 0) + 1;
  counters[prefix] = nextSeq;
  saveCounters(counters);

  const assignedId = formatSequentialId(prefix, nextSeq);

  if (identifier && identifier.trim()) {
    const registry = getRegistry();
    registry[normalizeKey(identifier)] = assignedId;
    saveRegistry(registry);
  }

  return assignedId;
}

/**
 * Retrieves the user ID if already allocated, or generates the next sequential ID.
 */
export function getOrAllocateUserId(
  role: string,
  user?: {
    id?: string;
    idNumber?: string;
    email?: string;
    phone?: string;
    name?: string;
  } | null
): string {
  if (user?.idNumber && isAssignedUserId(user.idNumber)) {
    return user.idNumber;
  }

  const keysToCheck = [
    user?.id,
    user?.email,
    user?.phone,
    user?.name,
  ].filter(Boolean) as string[];

  const registry = getRegistry();
  for (const k of keysToCheck) {
    const existing = registry[normalizeKey(k)];
    if (existing && isAssignedUserId(existing)) {
      return existing;
    }
  }

  // Not found in registry, allocate a new sequential ID
  const primaryKey = keysToCheck[0] || `user_${Date.now()}_${Math.random()}`;
  const newId = allocateNextUserId(role, primaryKey);

  // Link all other keys to this same ID for consistency
  keysToCheck.forEach((k) => {
    registry[normalizeKey(k)] = newId;
  });
  saveRegistry(registry);

  return newId;
}
