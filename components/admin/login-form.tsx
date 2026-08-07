"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";

type Step = "email" | "code";

export function AdminLoginForm({ locale, mailpitUiUrl }: { locale: string; mailpitUiUrl?: string }) {
  const router = useRouter();
  const t = useTranslations("admin.login");
  const { notify } = useToast();

  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify({ title: t("codeSendError"), variant: "error", technicalDetail: data.error });
        return;
      }

      setStep("code");
      notify({
        title: t("codeSent"),
        description: mailpitUiUrl
          ? t("codeSentDescription", { mailpitUrl: mailpitUiUrl })
          : t("codeSentDescriptionNoMailpit"),
      });
    } catch (error) {
      notify({
        title: t("connectionError"),
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify({ title: t("codeInvalid"), description: data.error, variant: "error" });
        return;
      }

      notify({ title: t("sessionStarted") });
      router.push(`/${locale}/admin`);
      router.refresh();
    } catch (error) {
      notify({
        title: t("connectionError"),
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-deep">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-medium text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t("subtitle")}</p>
      </div>

      {step === "email" ? (
        <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                required
                autoFocus
                className="pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@economyandfaircompetition.com"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? t("sending") : t("sendCode")}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="code">{t("codeLabel")}</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              className="mt-1.5 text-center font-mono text-lg tracking-[0.3em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
            />
          </div>
          <Button type="submit" disabled={loading || code.length !== 6}>
            {loading ? t("verifying") : t("verify")}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setStep("email")}>
            {t("useAnotherEmail")}
          </Button>
        </form>
      )}
    </div>
  );
}
