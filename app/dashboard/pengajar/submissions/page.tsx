import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "../../logout-button";
import GradeModal from "./grade-modal";

export default async function SubmissionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const payload = await decrypt(token);
  if (!payload?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, nama: true, role: true },
  });

  if (!user || user.role !== "PENGAJAR") redirect("/dashboard");

  // Ambil semua submission dari modul milik pengajar ini
  const submissions = await prisma.taskSubmission.findMany({
    where: {
      module: {
        course: { pengajarId: user.id },
      },
    },
    include: {
      user: { select: { nama: true, email: true } },
      module: { select: { judul: true, course: { select: { judul: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = submissions.filter((s) => s.status === "PENDING");
  const graded = submissions.filter((s) => s.status === "GRADED");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/pengajar" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Ngosan</span>
            </Link>
            <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">Pengajar</span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Koreksi Tugas</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {pending.length} menunggu penilaian · {graded.length} sudah dinilai
            </p>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            ⏳ Menunggu Penilaian ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-slate-500 dark:text-slate-400">Tidak ada tugas yang menunggu.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((sub) => (
                <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{sub.user.nama}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sub.user.email}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      📚 {sub.module.course.judul} → {sub.module.judul}
                    </p>
                    <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all">
                      {sub.submissionUrl}
                    </a>
                    {sub.notes && <p className="text-xs text-slate-400 mt-1 italic">&quot;{sub.notes}&quot;</p>}
                  </div>
                  <GradeModal submissionId={sub.id} studentName={sub.user.nama} moduleName={sub.module.judul} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Graded Submissions */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            ✅ Sudah Dinilai ({graded.length})
          </h2>
          {graded.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">Belum ada tugas yang dinilai.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {graded.map((sub) => (
                <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{sub.user.nama}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      📚 {sub.module.course.judul} → {sub.module.judul}
                    </p>
                    {sub.feedback && <p className="text-xs text-slate-400 mt-1 italic">&quot;{sub.feedback}&quot;</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{sub.grade}</p>
                    <p className="text-xs text-slate-400">/100</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
