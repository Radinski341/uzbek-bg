// src/app/api/slides/route.ts
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { signBannerMedia } from "@/lib/media/signBannerMedia";

const prisma = new PrismaClient();

export async function GET() {
  const slides = await prisma.slide.findMany({
    include: {
      items: {
        include: { banner: { include: { template: { include: { fields: true } } } } },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const signedSlides = await Promise.all(
    slides.map(async (slide) => ({
      ...slide,
      items: await Promise.all(
        slide.items.map(async (item) => ({
          ...item,
          banner: {
            ...item.banner,
            data: await signBannerMedia(item.banner.template, item.banner.data),
          },
        }))
      ),
    }))
  );
  return Response.json({ slides: signedSlides });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, speedMs, effect, bannerIds } = body as { name: string; speedMs: number; effect: "FADE" | "SLIDE"; bannerIds: string[] };
  if (!name || !Array.isArray(bannerIds)) return new Response("Invalid", { status: 400 });

  const slide = await prisma.slide.create({
    data: {
      name,
      speedMs: Math.max(1500, Number(speedMs || 8000)),
      effect: effect ?? "FADE",
      items: {
        create: bannerIds.map((id, i) => ({ bannerId: id, order: i })),
      },
    },
  });
  return Response.json(slide);
}