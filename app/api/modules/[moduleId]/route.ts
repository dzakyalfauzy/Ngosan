import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PATCH /api/modules/:moduleId — Edit modul
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId || payload.role !== "PENGAJAR") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const modul = await prisma.module.findFirst({
      where: { id: moduleId },
      include: { course: { select: { pengajarId: true } } },
    });
    if (!modul || modul.course.pengajarId !== payload.userId) {
      return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const { judul, konten, quizPassword, taskInstruction } = body;

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(judul !== undefined && { judul }),
        ...(konten !== undefined && { konten }),
        ...(quizPassword !== undefined && { quizPassword }),
        ...(taskInstruction !== undefined && { taskInstruction: taskInstruction || null }),
      },
    });

    return NextResponse.json({ message: "Modul berhasil diupdate!", module: updated });
  } catch (error) {
    console.error("Update module error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE /api/modules/:moduleId — Hapus modul
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId || payload.role !== "PENGAJAR") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const modul = await prisma.module.findFirst({
      where: { id: moduleId },
      include: { course: { select: { pengajarId: true } } },
    });
    if (!modul || modul.course.pengajarId !== payload.userId) {
      return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
    }

    // Hapus data terkait
    await prisma.taskSubmission.deleteMany({ where: { moduleId } });
    await prisma.moduleProgress.deleteMany({ where: { moduleId } });
    await prisma.module.delete({ where: { id: moduleId } });

    return NextResponse.json({ message: "Modul berhasil dihapus!" });
  } catch (error) {
    console.error("Delete module error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
