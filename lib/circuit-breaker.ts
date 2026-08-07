import { getDb } from "./db";
import { childLogger } from "./logger";

const log = childLogger("circuit-breaker");

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

type CircuitDoc = {
  _id: string;
  state: CircuitState;
  failureCount: number;
  lastFailureAt: Date | null;
  openedAt: Date | null;
  updatedAt: Date;
};

const FAILURE_THRESHOLD = 5;
const OPEN_COOLDOWN_MS = 60_000;

async function getCircuitCollection() {
  const db = await getDb();
  return db.collection<CircuitDoc>("circuit_breaker_state");
}

async function readState(serviceName: string): Promise<CircuitDoc> {
  const coll = await getCircuitCollection();
  const existing = await coll.findOne({ _id: serviceName });
  if (existing) return existing;

  const fresh: CircuitDoc = {
    _id: serviceName,
    state: "CLOSED",
    failureCount: 0,
    lastFailureAt: null,
    openedAt: null,
    updatedAt: new Date(),
  };
  await coll.insertOne(fresh);
  return fresh;
}

async function writeState(serviceName: string, patch: Partial<CircuitDoc>) {
  const coll = await getCircuitCollection();
  await coll.updateOne(
    { _id: serviceName },
    { $set: { ...patch, updatedAt: new Date() } },
    { upsert: true }
  );
}

/**
 * Envuelve una llamada a un servicio externo crítico (Resend, proveedor WhatsApp/MCP)
 * con el patrón circuit breaker. Estado persistido en Mongo para sobrevivir reinicios
 * y ser auditable vía la colección circuit_breaker_state.
 */
export async function withCircuitBreaker<T>(
  serviceName: string,
  action: () => Promise<T>,
  fallback: (reason: "circuit_open" | "action_failed", error?: unknown) => Promise<T> | T
): Promise<T> {
  const current = await readState(serviceName);

  if (current.state === "OPEN") {
    const openedAt = current.openedAt?.getTime() ?? 0;
    const elapsed = Date.now() - openedAt;

    if (elapsed < OPEN_COOLDOWN_MS) {
      log.warn({ serviceName, elapsed }, "Circuito abierto, usando fallback");
      return fallback("circuit_open");
    }

    await writeState(serviceName, { state: "HALF_OPEN" });
    log.info({ serviceName }, "Circuito pasa a HALF_OPEN para probar el servicio");
  }

  try {
    const result = await action();

    if (current.state !== "CLOSED") {
      await writeState(serviceName, { state: "CLOSED", failureCount: 0, openedAt: null });
      log.info({ serviceName }, "Circuito cerrado tras llamada exitosa");
    }

    return result;
  } catch (error) {
    const failureCount = current.failureCount + 1;

    if (failureCount >= FAILURE_THRESHOLD) {
      await writeState(serviceName, {
        state: "OPEN",
        failureCount,
        lastFailureAt: new Date(),
        openedAt: new Date(),
      });
      log.error({ serviceName, failureCount, error }, "Circuito abierto por fallos consecutivos");
    } else {
      await writeState(serviceName, {
        state: current.state === "HALF_OPEN" ? "OPEN" : "CLOSED",
        failureCount,
        lastFailureAt: new Date(),
        openedAt: current.state === "HALF_OPEN" ? new Date() : null,
      });
      log.warn({ serviceName, failureCount, error }, "Fallo registrado en servicio externo");
    }

    return fallback("action_failed", error);
  }
}
