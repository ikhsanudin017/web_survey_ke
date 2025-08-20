import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const category: string = data.get('category') as string

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const path = join(process.cwd(), "public/uploads", filename)

    // Write the file
    await writeFile(path, buffer)

    return NextResponse.json({ 
      message: "File uploaded successfully",
      filename: filename,
      originalName: file.name,
      size: file.size,
      category: category,
      url: `/uploads/${filename}`
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
