import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        pengajar: {
          select: { id: true, nama: true },
        },
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Get courses error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kelas." },
      { status: 500 }
    );
  }
}
