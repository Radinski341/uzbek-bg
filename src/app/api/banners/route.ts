// src/app/api/banners/route.ts
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadFile } from "@/lib/aws/s3Functions";
import { signBannerMedia } from "@/lib/media/signBannerMedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  const banners = await prisma.banner.findMany({
    include: { template: {include: { fields: true }} },
    orderBy: { createdAt: "desc" },
  });
  const signedBanners = await Promise.all(
    banners.map(async (b) => ({
      ...b,
      data: await signBannerMedia(b.template, b.data),
    }))
  );
  return Response.json({ banners: signedBanners });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const templateId = String(form.get("templateId") || "");
  if (!templateId) return new Response("Missing templateId", { status: 400 });

  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: { fields: { orderBy: { order: "asc" } } },
  });
  if (!template) return new Response("Template not found", { status: 404 });

  const data: Record<string, any> = {};

  for (const f of template.fields) {
    const key = f.key;

    if (f.type === "IMAGE") {
      if (f.isArray) {
        const files = form.getAll(key) as File[];
        if (!files.length && f.required)
          return new Response(`Missing files for ${key}`, { status: 400 });

        data[key] = [];
        for (const file of files) {
          if (!(file instanceof File)) continue;
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name}`;
          await uploadFile({
            fileBuffer: buffer,
            fileName,
            fileType: file.type || "application/octet-stream",
          });
          data[key].push(fileName);
        }
      } else {
        const file = form.get(key) as File | null;
        if (!file) {
          if (f.required)
            return new Response(`Missing file ${key}`, { status: 400 });
          continue;
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${file.name}`;
        await uploadFile({
          fileBuffer: buffer,
          fileName,
          fileType: file.type || "application/octet-stream",
        });
        data[key] = fileName;
      }
      continue;
    }

    if (f.isArray) {
      const raw = form.get(`${key}__json`)?.toString();
      const parsed = raw ? JSON.parse(raw) : [];
      if (f.required && (!parsed || parsed.length === 0))
        return new Response(`Field ${key} requires at least one item`, {
          status: 400,
        });
      if (f.type === "NUMBER") {
        data[key] = parsed.map((v: any) => Number(v ?? 0));
      } else {
        data[key] = parsed;
      }
      continue;
    }

    const val = form.get(key)?.toString();
    if (f.required && (val === undefined || val === null || val === ""))
      return new Response(`Field ${key} is required`, { status: 400 });

    switch (f.type) {
      case "NUMBER":
        data[key] = val === "" ? null : Number(val);
        break;
      case "BOOLEAN":
        data[key] = val === "true" || val === "on";
        break;
      default:
        data[key] = val ?? "";
    }
  }

  const created = await prisma.banner.create({ data: { templateId, data } });
  return Response.json(created);
}