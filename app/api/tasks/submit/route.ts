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

    const { moduleId, submissionUrl, notes } = await request.json();

    if (!moduleId || !submissionUrl) {
      return NextResponse.json({ error: "moduleId dan submissionUrl wajib diisi." }, { status: 400 });
    }

    const modul = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!modul || !modul.taskInstruction) {
      return NextResponse.json({ error: "Modul tidak memiliki tugas." }, { status: 404 });
    }

    const submission = await prisma.taskSubmission.upsert({
      where: {
        userId_moduleId: {
          userId: payload.userId as string,
          moduleId,
        },
      },
      update: { submissionUrl, notes: notes || null, status: "PENDING", grade: null, feedback: null },
      create: {
        userId: payload.userId as string,
        moduleId,
        submissionUrl,
        notes: notes || null,
      },
    });

    return NextResponse.json({ message: "Tugas berhasil dikirim!", submission });
  } catch (error) {
    console.error("Submit task error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "Silakan login." }, { status: 401 });

    const payload = await decrypt(token);
    if (!payload?.userId) return NextResponse.json({ error: "Session tidak valid." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");
    if (!moduleId) return NextResponse.json({ error: "moduleId wajib diisi." }, { status: 400 });

    const submission = await prisma.taskSubmission.findUnique({
      where: {
        userId_moduleId: {
          userId: payload.userId as string,
          moduleId,
        },
      },
    });

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
