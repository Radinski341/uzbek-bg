// src/app/api/banners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { uploadFile } from "@/lib/aws/s3Functions";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const banner = await prisma.banner.findUnique({
    where: { id },
    include: { template: { include: { fields: { orderBy: { order: "asc" } } } } },
  });
  if (!banner) return new Response("Banner not found", { status: 404 });

  const template = banner.template;
  const form = await req.formData();
  const data: Record<string, any> = { ...(banner.data as Record<string, any> || {}) };

  for (const f of template.fields) {
    const key = f.key;

    if (f.type === "IMAGE") {
      if (f.isArray) {
        let existing: string[] = [];
        const existingRaw = form.get(`${key}_existing`);
        if (existingRaw) {
          existing = JSON.parse(existingRaw.toString());
        } else {
          existing = data[key] || [];
        }

        const files = form.getAll(key) as File[];
        const newFilenames: string[] = [];

        if (files.length > 0) {
          for (const file of files) {
            if (!(file instanceof File)) continue;
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${Date.now()}-${file.name}`;
            await uploadFile({
              fileBuffer: buffer,
              fileName,
              fileType: file.type || "application/octet-stream",
            });
            newFilenames.push(fileName);
          }
        }

        data[key] = [...existing, ...newFilenames];

        if (data[key].length === 0 && f.required) {
          return new Response(`Missing files for ${key}`, { status: 400 });
        }
        continue;
      } else {
        const file = form.get(key) as File | null;
        if (file) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const fileName = `${Date.now()}-${file.name}`;
          await uploadFile({
            fileBuffer: buffer,
            fileName,
            fileType: file.type || "application/octet-stream",
          });
          data[key] = fileName;
        }
        // else keep existing data[key]

        if (!data[key] && f.required) {
          return new Response(`Missing file ${key}`, { status: 400 });
        }
        continue;
      }
    }

    // ARRAY (non-image)
    if (f.isArray) {
      const raw = form.get(`${key}__json`)?.toString();
      if (raw) {
        const parsed = JSON.parse(raw);
        if (f.required && (!parsed || parsed.length === 0)) {
          return new Response(`Field ${key} requires at least one item`, { status: 400 });
        }
        if (f.type === "NUMBER") {
          data[key] = parsed.map((v: any) => Number(v ?? 0));
        } else {
          data[key] = parsed;
        }
      }
      // else keep existing

      continue;
    }

    // SCALAR fields
    const val = form.get(key)?.toString();
    if (val !== undefined) {
      if (f.required && (val === "")) {
        return new Response(`Field ${key} is required`, { status: 400 });
      }

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
    // else keep existing
  }

  const updated = await prisma.banner.update({ where: { id }, data: { data } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.banner.delete({ where: { id } });
  return new Response(null, { status: 204 });
}