import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddModuleModal from "./add-module-modal";
import PublishButton from "./publish-button";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function PengajarCoursePage({ params }: Props) {
  const { courseId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const payload = await decrypt(token);
  if (!payload?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "PENGAJAR") redirect("/dashboard");

  const course = await prisma.course.findFirst({
    where: { id: courseId, pengajarId: user.id },
    include: {
      modules: { orderBy: { urutan: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/dashboard/pengajar"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            ← Kembali ke Daftar Kelas
          </Link>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                course.isPublished
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
              }`}
            >
              {course.isPublished ? "Published" : "Draft"}
            </span>
            <PublishButton courseId={course.id} isPublished={course.isPublished} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Course Info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {course.judul}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {course.deskripsi}
          </p>
          <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>📚 {course.modules.length} Modul</span>
            <span>👥 {course._count.enrollments} Peserta</span>
          </div>
        </div>

        {/* Module List Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Daftar Modul
          </h2>
          <AddModuleModal courseId={course.id} />
        </div>

        {/* Module List */}
        {course.modules.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">
              Belum ada modul
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Klik &quot;Tambah Modul Baru&quot; untuk menambahkan materi pertama.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.modules.map((modul) => (
              <div
                key={modul.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                      {modul.urutan}
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {modul.judul}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {modul.konten.substring(0, 120)}...
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4">
                    🔑 {modul.quizPassword}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
