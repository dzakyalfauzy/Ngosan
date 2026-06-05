import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ error: "Session tidak valid." }, { status: 401 });

    // Verifikasi admin
    const admin = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya admin yang bisa menghapus user." }, { status: 403 });
    }

    // Cegah admin menghapus diri sendiri
    if (userId === payload.userId) {
      return NextResponse.json({ error: "Tidak bisa menghapus akun sendiri." }, { status: 400 });
    }

    // Cek user yang akan dihapus
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nama: true, role: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Hapus semua data terkait dengan transaksi
    await prisma.$transaction(async (tx) => {
      // Hapus task submissions milik user
      await tx.taskSubmission.deleteMany({ where: { userId } });

      // Hapus module progress milik user
      await tx.moduleProgress.deleteMany({ where: { userId } });

      // Hapus enrollments milik user
      await tx.enrollment.deleteMany({ where: { userId } });

      // Jika user adalah pengajar, hapus juga kelas yang dibuat
      if (targetUser.role === "PENGAJAR") {
        const courses = await tx.course.findMany({
          where: { pengajarId: userId },
          select: { id: true },
        });
        const courseIds = courses.map((c) => c.id);

        if (courseIds.length > 0) {
          const modules = await tx.module.findMany({
            where: { courseId: { in: courseIds } },
            select: { id: true },
          });
          const moduleIds = modules.map((m) => m.id);

          if (moduleIds.length > 0) {
            await tx.taskSubmission.deleteMany({ where: { moduleId: { in: moduleIds } } });
            await tx.moduleProgress.deleteMany({ where: { moduleId: { in: moduleIds } } });
          }
          await tx.enrollment.deleteMany({ where: { courseId: { in: courseIds } } });
          await tx.module.deleteMany({ where: { courseId: { in: courseIds } } });
          await tx.course.deleteMany({ where: { id: { in: courseIds } } });
        }
      }

      // Hapus user
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({
      message: `User ${targetUser.nama} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
