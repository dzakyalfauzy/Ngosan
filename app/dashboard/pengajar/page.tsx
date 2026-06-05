import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "../logout-button";
import CreateCourseModal from "./create-course-modal";
import EditCourseModal from "./edit-course-modal";
import DeleteCourseButton from "./delete-course-button";

export default async function PengajarDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const payload = await decrypt(token);
  if (!payload?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, nama: true, email: true, role: true },
  });

  if (!user || user.role !== "PENGAJAR") redirect("/dashboard");

  const courses = await prisma.course.findMany({
    where: { pengajarId: user.id },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Ngosan
              </span>
            </Link>
            <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
              Pengajar
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 mb-8 text-white">
          <p className="text-blue-100 text-sm font-medium">Ruang Pengajar</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">{user.nama}</h1>
          <p className="text-blue-100 text-sm mt-1">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Kelas</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {courses.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Modul</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {courses.reduce((sum, c) => sum + c._count.modules, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Peserta</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {courses.reduce((sum, c) => sum + c._count.enrollments, 0)}
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard/pengajar/submissions"
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition"
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-white">📝 Koreksi Tugas</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lihat dan nilai tugas peserta</p>
          </Link>
          <Link
            href="/dashboard/pengajar/statistik"
            className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition block"
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-white">📊 Statistik</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Pantau performa kelas Anda</p>
          </Link>
        </div>

        {/* Action + List */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Kelas Saya
          </h2>
          <CreateCourseModal />
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-lg font-medium text-slate-900 dark:text-white">
              Belum ada kelas
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Klik &quot;Buat Kelas Baru&quot; untuk membuat kelas pertamamu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/pengajar/courses/${course.id}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition block"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                    {course.judul}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      course.isPublished
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {course.deskripsi}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex gap-4">
                    <span>📚 {course._count.modules} Modul</span>
                    <span>👥 {course._count.enrollments} Peserta</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EditCourseModal
                      courseId={course.id}
                      currentJudul={course.judul}
                      currentDeskripsi={course.deskripsi}
                    />
                    <DeleteCourseButton courseId={course.id} courseName={course.judul} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
