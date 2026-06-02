import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LearningView from "./learning-view";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: Props) {
  const { courseId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) redirect("/login");

  const payload = await decrypt(token);
  if (!payload?.userId) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      pengajar: { select: { nama: true } },
      modules: { orderBy: { urutan: "asc" } },
    },
  });

  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: payload.userId as string,
        courseId,
      },
    },
  });

  if (!enrollment) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            ← Kembali ke Dashboard
          </Link>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {course.judul}
          </span>
        </div>
      </header>

      <LearningView
        courseId={course.id}
        courseTitle={course.judul}
        pengajarNama={course.pengajar.nama}
        modules={course.modules.map((m) => ({
          id: m.id,
          judul: m.judul,
          urutan: m.urutan,
          konten: m.konten,
          taskInstruction: m.taskInstruction,
        }))}
      />
    </div>
  );
}
