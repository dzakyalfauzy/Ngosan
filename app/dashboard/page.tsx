import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "./logout-button";
import CourseList from "./course-list";
import EnrolledCourses from "./enrolled-courses";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) redirect("/login");

  const payload = await decrypt(token);
  if (!payload?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, nama: true, email: true, role: true },
  });

  if (!user) redirect("/login");

  // Redirect berdasarkan role
  if (user.role === "PENGAJAR") redirect("/dashboard/pengajar");
  if (user.role === "ADMIN") redirect("/dashboard/admin");

  const roleLabel: Record<string, string> = {
    ADMIN: "Administrator",
    PENGAJAR: "Pengajar",
    PESERTA: "Peserta",
  };

  // Ambil stats untuk PESERTA
  let pesertaStats = { kelasDiikuti: 0, modulSelesai: 0, progressRata: 0 };
  if (user.role === "PESERTA") {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      select: { progress: true },
    });

    const modulSelesai = await prisma.moduleProgress.count({
      where: { userId: user.id, completed: true },
    });

    const avgProgress =
      enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0;

    pesertaStats = {
      kelasDiikuti: enrollments.length,
      modulSelesai,
      progressRata: avgProgress,
    };
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Ngosan
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 mb-8 text-white">
          <p className="text-emerald-100 text-sm font-medium">
            Selamat datang kembali,
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">{user.nama}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-emerald-100">{user.email}</span>
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">
              {roleLabel[user.role] || user.role}
            </span>
          </div>
        </div>

        {/* Role-based Content */}
        {user.role === "ADMIN" && <AdminPanel />}
        {user.role === "PENGAJAR" && <PengajarPanel />}
        {user.role === "PESERTA" && <PesertaPanel stats={pesertaStats} />}
      </main>
    </div>
  );
}

/* ── Admin Panel ── */
function AdminPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Panel Kontrol Admin
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total User" value="—" icon="👥" />
        <StatCard label="Total Kursus" value="—" icon="📚" />
        <StatCard label="Kelas Aktif" value="—" icon="🏫" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Widget title="Kelola User" description="Atur role dan status pengguna platform" />
        <Widget title="Kelola Kursus" description="Buat, edit, dan publikasikan kursus baru" />
        <Widget title="Statistik Sistem" description="Pantau performa dan penggunaan platform" />
        <Widget title="Pengaturan" description="Konfigurasi sistem dan preferensi global" />
      </div>
    </div>
  );
}

/* ── Pengajar Panel ── */
function PengajarPanel() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Ruang Pengajar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Kelas Saya" value="—" icon="🎓" />
        <StatCard label="Materi Aktif" value="—" icon="📝" />
        <StatCard label="Tugas Dikumpulkan" value="—" icon="📬" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Widget title="Manajemen Kelas" description="Lihat dan kelola kelas yang Anda ampu" />
        <Widget title="Buat Materi" description="Tambahkan materi pembelajaran coding baru" />
        <Widget title="Koreksi Tugas" description="Nilai dan berikan feedback tugas siswa" />
        <Widget title="Diskusi" description="Balas pertanyaan dari peserta didik" />
      </div>
    </div>
  );
}

/* ── Peserta Panel ── */
interface PesertaStats {
  kelasDiikuti: number;
  modulSelesai: number;
  progressRata: number;
}

function PesertaPanel({ stats }: { stats: PesertaStats }) {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
        Ruang Belajar
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Kelas Diikuti" value={String(stats.kelasDiikuti)} icon="📖" />
        <StatCard label="Modul Selesai" value={String(stats.modulSelesai)} icon="✅" />
        <StatCard label="Progress Belajar" value={`${stats.progressRata}%`} icon="📊" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/tugas"
          className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition block"
        >
          <p className="text-lg font-semibold text-slate-900 dark:text-white">📝 Tugas & Kuis</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kerjakan tugas dan lihat nilai</p>
        </Link>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">📊 Progress Belajar</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rata-rata: {stats.progressRata}%</p>
        </div>
      </div>

      {/* Kelas yang Diikuti */}
      {stats.kelasDiikuti > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Kelas Saya
          </h3>
          <EnrolledCourses />
        </div>
      )}

      {/* Kelas Tersedia */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Kelas Tersedia
        </h3>
        <CourseList />
      </div>
    </div>
  );
}

/* ── Reusable Components ── */
function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function Widget({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition cursor-pointer">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        {description}
      </p>
    </div>
  );
}
