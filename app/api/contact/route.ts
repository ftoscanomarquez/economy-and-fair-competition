import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { sendEmail } from "@/lib/mailer";
import { childLogger } from "@/lib/logger";

const log = childLogger("api:contact");

const bodySchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  areaOfInterest: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`contact:${ip}`, { maxRequests: 5, windowMs: 60_000 });
  if (!rateLimit.allowed) {
    return apiError("Demasiadas solicitudes. Intente de nuevo en unos minutos.", 429);
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiError("Datos del formulario inválidos.", 400);
  }

  const { name, company, email, phone, areaOfInterest, message } = parsed.data;
  const env = getEnv();
  const db = await getDb();
  const now = new Date();

  const submission = {
    name,
    company: company ?? null,
    email,
    phone: phone ?? null,
    areaOfInterest: areaOfInterest ?? null,
    message,
    createdAt: now,
    emailDelivered: false,
  };

  const insertResult = await db.collection("contact_submissions").insertOne(submission);

  const emailResult = await sendEmail({
    to: env.CONTACT_NOTIFICATION_EMAIL,
    replyTo: email,
    subject: `Nuevo contacto: ${name}${company ? ` (${company})` : ""}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px;">
        <h2>Nuevo mensaje de contacto</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
        ${company ? `<p><strong>Empresa:</strong> ${escapeHtml(company)}</p>` : ""}
        <p><strong>Correo:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ""}
        ${areaOfInterest ? `<p><strong>Área de interés:</strong> ${escapeHtml(areaOfInterest)}</p>` : ""}
        <p><strong>Mensaje:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>
    `,
  });

  if (emailResult.delivered) {
    await db
      .collection("contact_submissions")
      .updateOne({ _id: insertResult.insertedId }, { $set: { emailDelivered: true } });
  }

  log.info(
    { id: insertResult.insertedId, emailDelivered: emailResult.delivered },
    "Formulario de contacto procesado"
  );

  return apiOk({ received: true });
}
