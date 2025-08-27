import { NextRequest, NextResponse } from "next/server"
import { put } from '@vercel/blob'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const category: string = data.get('category') as string

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 })
    }

    // Create unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({ 
      message: "File uploaded successfully",
      filename: filename,
      originalName: file.name,
      size: file.size,
      category: category,
      url: blob.url
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
