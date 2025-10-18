import { NextRequest } from "next/server";
import { PrismaClient, FieldType } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const templates = await prisma.template.findMany({ include: { fields: { orderBy: { order: 'asc' } } }});
  return Response.json({ templates });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, fields } = body as { name:string; fields: Array<{key:string;label:string;type: keyof typeof FieldType; required?:boolean}> };
  if (!name || !fields?.length) return new Response("Invalid", { status: 400 });

  const created = await prisma.template.create({
    data: {
      name,
      fields: { create: fields.map((f, i) => ({ key: f.key, label: f.label ?? f.key, type: f.type as any, required: !!f.required, order: i })) }
    },
    include: { fields: true }
  });
  return Response.json(created);
}
