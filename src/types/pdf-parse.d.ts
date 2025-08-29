declare module 'pdf-parse' {
  export interface PDFParseResult {
    text: string
    // Allow extra fields without specifying them all
    [key: string]: any
  }
  export default function pdfParse(
    data: Buffer | Uint8Array | ArrayBuffer
  ): Promise<PDFParseResult>
}

