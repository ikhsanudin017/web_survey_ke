import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, position } = await request.json()

    // Check if user already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword,
        position
      }
    })

    return NextResponse.json(
      { message: "Pegawai berhasil didaftarkan", employeeId: employee.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat registrasi" },
      { status: 500 }
    )
  }
}
