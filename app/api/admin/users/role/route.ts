import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ error: "Session tidak valid." }, { status: 401 });

    // Verifikasi ulang bahwa yang mengakses benar-benar ADMIN
    const admin = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya admin yang bisa mengubah role." }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId dan role wajib diisi." }, { status: 400 });
    }

    const validRoles = ["ADMIN", "PENGAJAR", "PESERTA"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
    }

    // Cek user yang akan diubah
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nama: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Cegah admin mengubah role diri sendiri
    if (userId === payload.userId) {
      return NextResponse.json({ error: "Tidak bisa mengubah role diri sendiri." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, nama: true, email: true, role: true },
    });

    return NextResponse.json({
      message: `Role ${updated.nama} berhasil diubah ke ${updated.role}`,
      user: updated,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
