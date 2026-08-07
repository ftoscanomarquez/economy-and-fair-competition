import nodemailer from "nodemailer";
import { Resend } from "resend";
import { getEnv } from "./env";
import { childLogger } from "./logger";
import { withCircuitBreaker } from "./circuit-breaker";

const log = childLogger("mailer");

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export type SendEmailResult = { delivered: boolean; provider: "resend" | "mailpit"; id?: string };

let mailpitTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getMailpitTransport() {
  if (!mailpitTransport) {
    const env = getEnv();
    mailpitTransport = nodemailer.createTransport({
      host: env.MAILPIT_HOST,
      port: env.MAILPIT_PORT,
      secure: false,
    });
  }
  return mailpitTransport;
}

async function sendViaMailpit(input: SendEmailInput): Promise<SendEmailResult> {
  const env = getEnv();
  const transport = getMailpitTransport();
  const info = await transport.sendMail({
    from: env.MAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
  log.info({ to: input.to, subject: input.subject, messageId: info.messageId }, "Correo enviado vía Mailpit");
  return { delivered: true, provider: "mailpit", id: info.messageId };
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const env = getEnv();
  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: env.MAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  log.info({ to: input.to, subject: input.subject, id: data?.id }, "Correo enviado vía Resend");
  return { delivered: true, provider: "resend", id: data?.id };
}

/**
 * Envía correo eligiendo el proveedor según NODE_ENV.
 * En producción, protegido por circuit breaker: si Resend falla repetidamente,
 * el circuito se abre y el fallback registra el intento fallido sin tumbar la petición.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const env = getEnv();

  if (env.NODE_ENV !== "production") {
    return sendViaMailpit(input);
  }

  return withCircuitBreaker(
    "resend",
    () => sendViaResend(input),
    (reason, error) => {
      log.error({ reason, error, to: input.to }, "No se pudo enviar correo vía Resend, aplicando fallback");
      return { delivered: false, provider: "resend" as const };
    }
  );
}
