import { SignJWT, jwtVerify } from "jose";
import crypto from "node:crypto";
import { getEnv, getAdminAllowedEmails } from "./env";
import { getDb } from "./db";
import { childLogger } from "./logger";

const log = childLogger("auth");

export type SessionPayload = {
  email: string;
  role: "admin";
};

function getSecretKey() {
  const env = getEnv();
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "admin" || typeof payload.email !== "string") return null;
    return { email: payload.email, role: "admin" };
  } catch (error) {
    log.warn({ error }, "Token de sesión inválido o expirado");
    return null;
  }
}

export function isEmailAllowed(email: string): boolean {
  return getAdminAllowedEmails().includes(email.trim().toLowerCase());
}

type AuthCodeDoc = {
  _id?: unknown;
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt: Date | null;
  createdAt: Date;
};

function hashCode(code: string): string {
  const env = getEnv();
  return crypto.createHmac("sha256", env.JWT_SECRET).update(code).digest("hex");
}

function generateSixDigitCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function issueMagicLinkCode(email: string): Promise<string> {
  const env = getEnv();
  const db = await getDb();
  const coll = db.collection<AuthCodeDoc>("auth_codes");

  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + env.MAGIC_LINK_CODE_TTL_MINUTES * 60_000);

  await coll.insertOne({
    email: email.toLowerCase(),
    codeHash: hashCode(code),
    expiresAt,
    attempts: 0,
    consumedAt: null,
    createdAt: new Date(),
  });

  log.info({ email }, "Código de magic link emitido");
  return code;
}

export type VerifyCodeResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "invalid_code" | "already_used" };

export async function verifyMagicLinkCode(email: string, code: string): Promise<VerifyCodeResult> {
  const env = getEnv();
  const db = await getDb();
  const coll = db.collection<AuthCodeDoc>("auth_codes");

  const normalizedEmail = email.toLowerCase();
  const record = await coll.findOne(
    { email: normalizedEmail, consumedAt: null },
    { sort: { createdAt: -1 } }
  );

  if (!record) return { ok: false, reason: "not_found" };
  if (record.consumedAt) return { ok: false, reason: "already_used" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expired" };
  if (record.attempts >= env.MAGIC_LINK_MAX_ATTEMPTS) return { ok: false, reason: "too_many_attempts" };

  const codeHash = hashCode(code);
  const matches = crypto.timingSafeEqual(
    Buffer.from(codeHash, "hex"),
    Buffer.from(record.codeHash, "hex")
  );

  if (!matches) {
    await coll.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return { ok: false, reason: "invalid_code" };
  }

  await coll.updateOne({ _id: record._id }, { $set: { consumedAt: new Date() } });
  log.info({ email: normalizedEmail }, "Código de magic link verificado correctamente");
  return { ok: true };
}
