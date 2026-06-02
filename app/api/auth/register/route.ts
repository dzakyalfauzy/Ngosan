import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { nama, email, password, role } = await request.json();

    if (!nama || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ["ADMIN", "PENGAJAR", "PESERTA"];
    const userRole = validRoles.includes(role) ? role : "PESERTA";

    const user = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil!",
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
