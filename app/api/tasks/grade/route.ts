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

    if (payload.role !== "PENGAJAR") {
      return NextResponse.json({ error: "Hanya pengajar yang bisa menilai tugas." }, { status: 403 });
    }

    const { submissionId, grade, feedback } = await request.json();

    if (!submissionId || grade === undefined || grade === null) {
      return NextResponse.json({ error: "submissionId dan grade wajib diisi." }, { status: 400 });
    }

    if (grade < 0 || grade > 100) {
      return NextResponse.json({ error: "Nilai harus 0-100." }, { status: 400 });
    }

    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submissionId },
      include: { module: { select: { courseId: true } } },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission tidak ditemukan." }, { status: 404 });
    }

    // Cek apakah kelas milik pengajar ini
    const course = await prisma.course.findFirst({
      where: { id: submission.module.courseId, pengajarId: payload.userId as string },
    });

    if (!course) {
      return NextResponse.json({ error: "Anda bukan pengajar kelas ini." }, { status: 403 });
    }

    const updated = await prisma.taskSubmission.update({
      where: { id: submissionId },
      data: { grade, feedback: feedback || null, status: "GRADED" },
    });

    return NextResponse.json({ message: "Penilaian berhasil disimpan!", submission: updated });
  } catch (error) {
    console.error("Grade error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
