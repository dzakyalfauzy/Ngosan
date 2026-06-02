import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ error: "Session tidak valid." }, { status: 401 });

    const { moduleId, courseId, quizAnswer } = await request.json();

    if (!moduleId || !courseId || !quizAnswer) {
      return NextResponse.json({ error: "moduleId, courseId, dan quizAnswer wajib diisi." }, { status: 400 });
    }

    // Ambil modul dan cek password kuis
    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });

    if (module.quizPassword !== quizAnswer.trim()) {
      return NextResponse.json({ error: "Password kuis salah. Baca materi lebih teliti!" }, { status: 400 });
    }

    // Tandai modul selesai (upsert agar idempotent)
    await prisma.moduleProgress.upsert({
      where: {
        userId_moduleId: {
          userId: payload.userId as string,
          moduleId,
        },
      },
      update: { completed: true },
      create: {
        userId: payload.userId as string,
        moduleId,
        completed: true,
      },
    });

    // Hitung progress: modul selesai / total modul * 100
    const totalModules = await prisma.module.count({ where: { courseId } });
    const completedModules = await prisma.moduleProgress.count({
      where: {
        userId: payload.userId as string,
        module: { courseId },
        completed: true,
      },
    });

    const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    // Update enrollment progress
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: payload.userId as string,
          courseId,
        },
      },
      data: {
        progress: progressPercent,
        status: progressPercent >= 100 ? "COMPLETED" : "ACTIVE",
      },
    });

    return NextResponse.json({
      message: "Modul ditandai selesai!",
      progress: progressPercent,
      completedModules,
      totalModules,
    });
  } catch (error) {
    console.error("Progress error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// GET: Ambil progress user untuk sebuah kelas
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ error: "Session tidak valid." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ error: "courseId wajib diisi." }, { status: 400 });

    // Ambil semua moduleId di kelas ini
    const modules = await prisma.module.findMany({
      where: { courseId },
      select: { id: true },
    });

    // Ambil modul yang sudah selesai
    const completed = await prisma.moduleProgress.findMany({
      where: {
        userId: payload.userId as string,
        moduleId: { in: modules.map((m) => m.id) },
        completed: true,
      },
      select: { moduleId: true },
    });

    return NextResponse.json({
      completedModuleIds: completed.map((c) => c.moduleId),
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
