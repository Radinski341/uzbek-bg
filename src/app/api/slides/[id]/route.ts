// src/app/api/slides/[id]/route.ts
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { signBannerMedia } from "@/lib/media/signBannerMedia";

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const slide = await prisma.slide.findUnique({
    where: { id: params.id },
    include: {
      items: { orderBy: { order: "asc" }, include: { banner: { include: { template: { include: { fields: true } } } } } },
    },
  });
  if (!slide) return new Response("Not found", { status: 404 });

  const signedItems = await Promise.all(
    slide.items.map(async (item) => ({
      ...item,
      banner: {
        ...item.banner,
        data: await signBannerMedia(item.banner.template, item.banner.data),
      },
    }))
  );
  const signedSlide = { ...slide, items: signedItems };

  // For client polling comparison
  const etag = `"v${slide.version}-${slide.updatedAt.getTime()}"`;
  return new Response(JSON.stringify(signedSlide), {
    headers: {
      "Content-Type": "application/json",
      "ETag": etag,
      "Cache-Control": "no-store",
    },
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json();
  const { name, speedMs, effect, bannerIds } = body as { name: string; speedMs: number; effect: "FADE" | "SLIDE"; bannerIds: string[] };
  if (!name || !Array.isArray(bannerIds)) return new Response("Invalid", { status: 400 });

  const slide = await prisma.slide.findUnique({ where: { id } });
  if (!slide) return new Response("Not found", { status: 404 });

  await prisma.slideItem.deleteMany({ where: { slideId: id } });

  const updated = await prisma.slide.update({
    where: { id },
    data: {
      name,
      speedMs: Math.max(1500, Number(speedMs || 8000)),
      effect: effect ?? "FADE",
      version: { increment: 1 },
    },
  });

  await prisma.slideItem.createMany({
    data: bannerIds.map((bannerId, i) => ({ slideId: id, bannerId, order: i })),
  });

  return Response.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  await prisma.slide.delete({ where: { id } });
  return new Response(null, { status: 204 });
}