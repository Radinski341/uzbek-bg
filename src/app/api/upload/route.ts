import { NextRequest } from "next/server";
import { IncomingForm, File } from "formidable";
import { mkdir, rename } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseForm(req: NextRequest): Promise<{ fields: any; files: any }> {
  return await new Promise((resolve, reject) => {
    const form = new IncomingForm({ multiples: false, keepExtensions: true });
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { files } = await parseForm(req);
    const f = (files.file as File);
    if (!f) return new Response(JSON.stringify({ error: "No file" }), { status: 400 });

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${f.originalFilename}`;
    const dest = path.join(uploadsDir, fileName);
    await rename(f.filepath, dest);

    const publicUrl = `/uploads/${fileName}`;
    return new Response(JSON.stringify({ url: publicUrl }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
