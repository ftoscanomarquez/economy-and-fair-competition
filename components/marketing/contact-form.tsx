"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/context/ToastContext";

type ContactFormLabels = Record<
  | "name"
  | "company"
  | "email"
  | "phone"
  | "areaOfInterest"
  | "message"
  | "submit"
  | "submitting"
  | "success"
  | "error",
  string
>;

export function ContactForm({ labels }: { labels: ContactFormLabels }) {
  const { notify } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      company: String(formData.get("company") ?? "") || undefined,
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? "") || undefined,
      areaOfInterest: String(formData.get("areaOfInterest") ?? "") || undefined,
      message: String(formData.get("message") ?? ""),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        notify({ title: labels.error, variant: "error", technicalDetail: data.error });
        return;
      }

      setSubmitted(true);
      notify({ title: labels.success });
    } catch (error) {
      notify({
        title: labels.error,
        variant: "error",
        technicalDetail: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-accent-deep/20 bg-accent-soft/30 p-8">
        <p className="text-ink">{labels.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{labels.name}</Label>
          <Input id="name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="company">{labels.company}</Label>
          <Input id="company" name="company" className="mt-1.5" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="email">{labels.email}</Label>
          <Input id="email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input id="phone" name="phone" type="tel" className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label htmlFor="areaOfInterest">{labels.areaOfInterest}</Label>
        <Input id="areaOfInterest" name="areaOfInterest" className="mt-1.5" />
      </div>

      <div>
        <Label htmlFor="message">{labels.message}</Label>
        <Textarea id="message" name="message" required rows={5} className="mt-1.5" />
      </div>

      <Button type="submit" variant="accent" size="lg" disabled={loading} className="mt-2 self-start">
        {loading ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
