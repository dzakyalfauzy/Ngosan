import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TasksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const payload = await decrypt(token);
  if (!payload?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, nama: true },
  });

  if (!user) redirect("/login");

  // Ambil semua submission milik user
  const submissions = await prisma.taskSubmission.findMany({
    where: { userId: user.id },
    include: {
      module: {
        select: {
          judul: true,
          urutan: true,
          taskInstruction: true,
          course: {
            select: { id: true, judul: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const graded = submissions.filter((s) => s.status === "GRADED");
  const pending = submissions.filter((s) => s.status === "PENDING");
  const avgGrade =
    graded.length > 0
      ? Math.round(graded.reduce((sum, s) => sum + (s.grade || 0), 0) / graded.length)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Ngosan</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Riwayat Tugas & Nilai
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {submissions.length} tugas dikumpulkan · {graded.length} sudah dinilai · {pending.length} menunggu
        </p>

        {/* Summary Cards */}
        {submissions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Tugas</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{submissions.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Rata-rata Nilai</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {graded.length > 0 ? avgGrade : "-"}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-600 dark:text-amber-400">Menunggu Penilaian</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pending.length}</p>
            </div>
          </div>
        )}

        {/* Submission List */}
        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">Belum ada tugas yang dikumpulkan</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Kerjakan tugas dari modul yang Anda ikuti, lalu kumpulkan di sana.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"
            >
              Mulai Belajar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {sub.module.course.judul}
                    </p>
                    <h3 className="font-semibold text-slate-900 dark:text-white mt-1">
                      Modul {sub.module.urutan}: {sub.module.judul}
                    </h3>

                    <a
                      href={sub.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:underline mt-1 inline-block break-all"
                    >
                      🔗 {sub.submissionUrl}
                    </a>

                    {sub.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                        &quot;{sub.notes}&quot;
                      </p>
                    )}

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      Dikumpulkan:{" "}
                      {new Date(sub.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* Status & Grade */}
                  <div className="flex-shrink-0">
                    {sub.status === "GRADED" ? (
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 flex flex-col items-center justify-center">
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                            {sub.grade}
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500">/100</p>
                        </div>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                          ✅ Sudah Dinilai
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 flex items-center justify-center">
                          <span className="text-2xl">⏳</span>
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                          Menunggu
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                {sub.feedback && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      💬 Catatan Pengajar:
                    </p>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {sub.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
