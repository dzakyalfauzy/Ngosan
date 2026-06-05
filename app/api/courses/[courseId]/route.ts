import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PATCH /api/courses/:courseId — Edit kelas
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId || payload.role !== "PENGAJAR") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, pengajarId: payload.userId as string },
    });
    if (!course) return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });

    const body = await request.json();
    const { judul, deskripsi, isPublished } = body;

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(judul !== undefined && { judul }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ message: "Kelas berhasil diupdate!", course: updated });
  } catch (error) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE /api/courses/:courseId — Hapus kelas
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId || payload.role !== "PENGAJAR") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, pengajarId: payload.userId as string },
    });
    if (!course) return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });

    // Hapus data terkait (cascade sudah di schema, tapi hapus manual untuk aman)
    const moduleIds = await prisma.module.findMany({
      where: { courseId },
      select: { id: true },
    });

    await prisma.taskSubmission.deleteMany({ where: { moduleId: { in: moduleIds.map(m => m.id) } } });
    await prisma.moduleProgress.deleteMany({ where: { moduleId: { in: moduleIds.map(m => m.id) } } });
    await prisma.enrollment.deleteMany({ where: { courseId } });
    await prisma.module.deleteMany({ where: { courseId } });
    await prisma.course.delete({ where: { id: courseId } });

    return NextResponse.json({ message: "Kelas berhasil dihapus!" });
  } catch (error) {
    console.error("Delete course error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
