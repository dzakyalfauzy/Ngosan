import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function StatistikPage() {
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

  // Ambil semua kelas pengajar
  const courses = await prisma.course.findMany({
    where: { pengajarId: user.id },
    include: {
      _count: { select: { modules: true, enrollments: true } },
      enrollments: {
        select: { progress: true, status: true },
      },
      modules: {
        select: {
          id: true,
          judul: true,
          _count: { select: { taskSubmissions: true, moduleProgress: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Hitung statistik global
  const totalCourses = courses.length;
  const totalModules = courses.reduce((sum, c) => sum + c._count.modules, 0);
  const totalPeserta = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const draftCourses = courses.filter((c) => !c.isPublished).length;

  // Hitung progress rata-rata semua peserta
  const allProgress = courses.flatMap((c) => c.enrollments.map((e) => e.progress));
  const avgProgress = allProgress.length > 0
    ? Math.round(allProgress.reduce((a, b) => a + b, 0) / allProgress.length)
    : 0;

  // Hitung submission stats
  const allModuleIds = courses.flatMap((c) => c.modules.map((m) => m.id));
  const totalSubmissions = await prisma.taskSubmission.count({
    where: { moduleId: { in: allModuleIds } },
  });
  const pendingSubmissions = await prisma.taskSubmission.count({
    where: { moduleId: { in: allModuleIds }, status: "PENDING" },
  });
  const gradedSubmissions = await prisma.taskSubmission.count({
    where: { moduleId: { in: allModuleIds }, status: "GRADED" },
  });

  // Hitung rata-rata nilai
  const gradedTasks = await prisma.taskSubmission.findMany({
    where: { moduleId: { in: allModuleIds }, status: "GRADED", grade: { not: null } },
    select: { grade: true },
  });
  const avgGrade = gradedTasks.length > 0
    ? Math.round(gradedTasks.reduce((sum, t) => sum + (t.grade || 0), 0) / gradedTasks.length)
    : 0;

  // Hitung total modul selesai
  const totalCompletedModules = await prisma.moduleProgress.count({
    where: { moduleId: { in: allModuleIds }, completed: true },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/pengajar" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">Ngosan</span>
          </Link>
          <Link href="/dashboard/pengajar" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition">
            ← Kembali
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Statistik Performa</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Ringkasan performa kelas dan peserta Anda</p>

        {/* Global Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatBox label="Total Kelas" value={totalCourses} icon="📚" sub={`${publishedCourses} published, ${draftCourses} draft`} />
          <StatBox label="Total Modul" value={totalModules} icon="📝" sub={`${totalCompletedModules} selesai oleh peserta`} />
          <StatBox label="Total Peserta" value={totalPeserta} icon="👥" sub={`Rata-rata progress ${avgProgress}%`} />
          <StatBox label="Rata-rata Nilai" value={avgGrade} icon="🏆" sub={`${gradedSubmissions} tugas dinilai`} />
        </div>

        {/* Submission Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Submission</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalSubmissions}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-600 dark:text-amber-400">Menunggu Penilaian</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingSubmissions}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Sudah Dinilai</p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{gradedSubmissions}</p>
          </div>
        </div>

        {/* Per Course Breakdown */}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Detail Per Kelas</h2>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-4xl mb-2">📊</p>
            <p className="text-slate-500 dark:text-slate-400">Belum ada data statistik.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const courseAvgProgress = course.enrollments.length > 0
                ? Math.round(course.enrollments.reduce((s, e) => s + e.progress, 0) / course.enrollments.length)
                : 0;
              const completedCount = course.enrollments.filter((e) => e.status === "COMPLETED").length;

              return (
                <div key={course.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{course.judul}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${course.isPublished ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Modul</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{course._count.modules}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Peserta</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{course._count.enrollments}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Selesai</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Rata-rata Progress</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{courseAvgProgress}%</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Progress rata-rata peserta</span>
                      <span>{courseAvgProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${courseAvgProgress}%` }} />
                    </div>
                  </div>

                  {/* Modul detail */}
                  {course.modules.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Detail Modul:</p>
                      <div className="space-y-1">
                        {course.modules.map((modul) => (
                          <div key={modul.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{modul.judul}</span>
                            <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span>✅ {modul._count.moduleProgress} selesai</span>
                              <span>📋 {modul._count.taskSubmissions} tugas</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function StatBox({ label, value, icon, sub }: { label: string; value: number; icon: string; sub: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>
    </div>
  );
}
