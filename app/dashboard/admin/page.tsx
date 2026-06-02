import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey || "");

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) {
    redirect("/login");
  }

  let session;
  try {
    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });
    session = payload as { userId: string; role: string };
  } catch {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Dashboard Admin
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Selamat datang di panel administrasi Ngosan.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Kelola User</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Atur pengguna dan role</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Kelola Kursus</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Atur kursus dan materi</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Statistik</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lihat laporan dan analitik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
