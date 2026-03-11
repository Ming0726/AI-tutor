import { PDFParse } from "pdf-parse";

export function extractTextFromTxt(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text ?? "";
}

export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === "txt") {
    return extractTextFromTxt(buffer);
  }
  if (fileType === "pdf") {
    return extractTextFromPdf(buffer);
  }
  throw new Error("Unsupported file type");
}
