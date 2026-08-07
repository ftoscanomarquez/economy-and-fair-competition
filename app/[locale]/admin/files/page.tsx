import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { isLocale, defaultLocale, type Locale } from "@/lib/i18n";
import { FilesManager } from "@/components/admin/files-manager";
import { listUploadedFiles } from "@/lib/uploads";

export const metadata = { title: "Archivos" };

export default async function AdminFilesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  const session = await getServerSession();
  if (!session) redirect(`/${locale}/admin/login`);

  const files = await listUploadedFiles();
  const serializedFiles = files.map((f) => ({ ...f, createdAt: f.createdAt.toISOString() }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent-deep">Panel administrativo</p>
      <h1 className="mt-3 font-display text-display-lg font-medium text-ink">Archivos</h1>
      <p className="mt-2 text-ink-soft">
        Imágenes y documentos subidos o generados con IA. Selecciona y elimina los que ya no necesites.
      </p>

      <FilesManager initialFiles={serializedFiles} />
    </div>
  );
}
