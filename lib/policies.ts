"use client";

export type InsuranceProductId = "flight" | "weather" | "cargo";
export type DashboardPolicyStatus = "active" | "paid";

export interface PolicyRecord {
  id: string;
  walletAddress: string;
  productId: InsuranceProductId;
  productLabel: string;
  flightNumber: string;
  routeFrom?: string;
  routeTo?: string;
  region?: string;
  cropType?: string;
  delayThreshold?: number;
  coverage: number;
  premium: number;
  appId: number;
  premiumPaymentTxId?: string;
  appCallTxId?: string;
  payoutTxId?: string;
  delayMinutes?: number;
  createdAt: string;
  updatedAt: string;
  payoutTriggeredAt?: string;
  lastOracleCheckAt?: string;
}

export interface CreatePolicyRecordInput {
  walletAddress: string;
  productId: InsuranceProductId;
  productLabel: string;
  flightNumber: string;
  routeFrom?: string;
  routeTo?: string;
  region?: string;
  cropType?: string;
  delayThreshold?: number;
  coverage: number;
  premium: number;
  appId: number;
  premiumPaymentTxId?: string;
  appCallTxId?: string;
}

export interface UpdatePolicyRecordInput {
  payoutTxId?: string;
  delayMinutes?: number;
  payoutTriggeredAt?: string;
  lastOracleCheckAt?: string;
}

export interface PolicyRepository {
  listByWallet(walletAddress: string): Promise<PolicyRecord[]>;
  create(input: CreatePolicyRecordInput): Promise<PolicyRecord>;
  update(
    id: string,
    input: UpdatePolicyRecordInput,
  ): Promise<PolicyRecord | null>;
}

const STORAGE_KEY = "aeroshield.policies.v1";
const STORAGE_UPDATED_EVENT = "aeroshield:policies-updated";

function hasBrowserStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function safeReadAll(): PolicyRecord[] {
  if (!hasBrowserStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PolicyRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function safeWriteAll(records: PolicyRecord[]) {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(STORAGE_UPDATED_EVENT));
}

function nowIso() {
  return new Date().toISOString();
}

function createRecordId(walletAddress: string) {
  const short = walletAddress.slice(0, 8).toLowerCase();
  return `plc_${short}_${Date.now()}`;
}

export function computePolicyStatus(
  policy: PolicyRecord,
): DashboardPolicyStatus {
  return policy.payoutTxId ? "paid" : "active";
}

export function getPolicyStorageKey() {
  return STORAGE_KEY;
}

export function getPolicyStorageUpdatedEventName() {
  return STORAGE_UPDATED_EVENT;
}

class LocalStoragePolicyRepository implements PolicyRepository {
  async listByWallet(walletAddress: string): Promise<PolicyRecord[]> {
    const normalized = walletAddress.toLowerCase();
    const all = safeReadAll();
    return all
      .filter((record) => record.walletAddress.toLowerCase() === normalized)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }

  async create(input: CreatePolicyRecordInput): Promise<PolicyRecord> {
    const timestamp = nowIso();
    const next: PolicyRecord = {
      id: createRecordId(input.walletAddress),
      walletAddress: input.walletAddress,
      productId: input.productId,
      productLabel: input.productLabel,
      flightNumber: input.flightNumber,
      routeFrom: input.routeFrom,
      routeTo: input.routeTo,
      region: input.region,
      cropType: input.cropType,
      delayThreshold: input.delayThreshold,
      coverage: input.coverage,
      premium: input.premium,
      appId: input.appId,
      premiumPaymentTxId: input.premiumPaymentTxId,
      appCallTxId: input.appCallTxId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const records = safeReadAll();
    records.unshift(next);
    safeWriteAll(records);
    return next;
  }

  async update(
    id: string,
    input: UpdatePolicyRecordInput,
  ): Promise<PolicyRecord | null> {
    const records = safeReadAll();
    const idx = records.findIndex((record) => record.id === id);
    if (idx < 0) return null;

    const updated: PolicyRecord = {
      ...records[idx],
      ...input,
      updatedAt: nowIso(),
    };

    records[idx] = updated;
    safeWriteAll(records);
    return updated;
  }
}

// Database-backed repository for Vercel/production deployments
class DbPolicyRepository implements PolicyRepository {
  async listByWallet(walletAddress: string): Promise<PolicyRecord[]> {
    try {
      const response = await fetch("/api/policies/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.policies || [];
    } catch {
      return [];
    }
  }

  async create(input: CreatePolicyRecordInput): Promise<PolicyRecord> {
    try {
      const response = await fetch("/api/policies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to create policy");
      const data = await response.json();
      return data.policy;
    } catch (error) {
      console.error("DbPolicyRepository.create error:", error);
      throw error;
    }
  }

  async update(
    id: string,
    input: UpdatePolicyRecordInput,
  ): Promise<PolicyRecord | null> {
    try {
      const response = await fetch("/api/policies/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...input }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.policy || null;
    } catch (error) {
      console.error("DbPolicyRepository.update error:", error);
      return null;
    }
  }
}

// Auto-select repository based on environment
function initializeRepository(): PolicyRepository {
  // Always use database-backed API repository for both local and deployed environments.
  // API routes hold DB credentials server-side; client never needs direct DATABASE_URL access.
  return new DbPolicyRepository();
}

export const policyRepository: PolicyRepository = initializeRepository();
