import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LogoutButton from "../logout-button";
import RoleSelector from "./role-selector";
import DeleteUserButton from "./delete-user-button";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const payload = await decrypt(token);
  if (!payload?.userId) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, nama: true, email: true, role: true },
  });

  if (!currentUser || currentUser.role !== "ADMIN") redirect("/dashboard");

  // Statistik platform
  const totalUsers = await prisma.user.count();
  const totalCourses = await prisma.course.count();
  const totalModules = await prisma.module.count();
  const totalEnrollments = await prisma.enrollment.count();

  // Ambil semua user
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          coursesCreated: true,
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const roleCount = {
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    PENGAJAR: users.filter((u) => u.role === "PENGAJAR").length,
    PESERTA: users.filter((u) => u.role === "PESERTA").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">Ngosan</span>
            </Link>
            <span className="text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 sm:p-8 mb-8 text-white">
          <p className="text-red-100 text-sm font-medium">Panel Super Admin</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">{currentUser.nama}</h1>
          <p className="text-red-100 text-sm mt-1">{currentUser.email}</p>
        </div>

        {/* Statistik Platform */}
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📊 Statistik Platform</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total User</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalUsers}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs text-red-500">{roleCount.ADMIN} Admin</span>
              <span className="text-xs text-blue-500">{roleCount.PENGAJAR} Pengajar</span>
              <span className="text-xs text-emerald-500">{roleCount.PESERTA} Peserta</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Kelas</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalCourses}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Modul</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalModules}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Enrollment</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalEnrollments}</p>
          </div>
        </div>

        {/* User Management */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">👥 Manajemen Pengguna</h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">{users.length} user terdaftar</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-6 py-4 font-semibold text-slate-900 dark:text-white">Nama</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-900 dark:text-white">Email</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-900 dark:text-white">Role</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-900 dark:text-white">Kelas</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-900 dark:text-white">Terdaftar</th>
                  <th className="text-left px-6 py-4 font-semibold text-slate-900 dark:text-white">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                          {user.nama.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {user.nama}
                          {user.id === currentUser.id && (
                            <span className="ml-2 text-xs text-slate-400">(Anda)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <RoleSelector
                        userId={user.id}
                        userName={user.nama}
                        currentRole={user.role}
                        isCurrentUser={user.id === currentUser.id}
                      />
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {user.role === "PENGAJAR" ? (
                        <span>{user._count.coursesCreated} dibuat</span>
                      ) : user.role === "PESERTA" ? (
                        <span>{user._count.enrollments} diikuti</span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <DeleteUserButton
                        userId={user.id}
                        userName={user.nama}
                        isCurrentUser={user.id === currentUser.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
