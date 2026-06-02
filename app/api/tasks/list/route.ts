import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ tasks: [] });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ tasks: [] });

    // Ambil semua kelas yang diikuti
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: payload.userId as string },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    // Ambil semua modul yang punya tugas dari kelas tersebut
    const modules = await prisma.module.findMany({
      where: {
        courseId: { in: courseIds },
        taskInstruction: { not: null },
      },
      include: {
        course: { select: { id: true, judul: true } },
        taskSubmissions: {
          where: { userId: payload.userId as string },
          select: { id: true, status: true, grade: true, feedback: true, submissionUrl: true },
        },
      },
      orderBy: { course: { judul: "asc" } },
    });

    const tasks = modules.map((m) => ({
      moduleId: m.id,
      moduleJudul: m.judul,
      urutan: m.urutan,
      taskInstruction: m.taskInstruction,
      courseId: m.course.id,
      courseJudul: m.course.judul,
      submission: m.taskSubmissions[0] || null,
    }));

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Get tasks list error:", error);
    return NextResponse.json({ tasks: [] });
  }
}
