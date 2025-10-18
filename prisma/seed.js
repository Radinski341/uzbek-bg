import { FieldType, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function upsertTemplate({ key, name, description, fields }) {
  const tpl = await prisma.template.upsert({
    where: { key },
    update: { name, description },
    create: { key, name, description },
  });
  await prisma.templateField.deleteMany({ where: { templateId: tpl.id } });
  await prisma.templateField.createMany({
    data: fields.map((f, i) => ({
      templateId: tpl.id,
      key: f.key,
      label: f.label ?? f.key,
      type: f.type,
      required: !!f.required,
      isArray: !!f.isArray,
      order: f.order ?? i,
      config: f.config ?? {},
    })),
  });
  return prisma.template.findUnique({
    where: { id: tpl.id },
    include: { fields: { orderBy: { order: 'asc' } } },
  });
}

async function main() {
  const email = 'admin@uztv.local';
  const password = 'Admin123!' // change
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password: hash, role: 'admin' }
  });

  // 1) Hero Dish
  const hero = await upsertTemplate({
    key: 'hero-dish',
    name: 'Hero Dish',
    description: 'Full-bleed image with overlay text and price.',
    fields: [
      { key: 'image',      label: 'Image',           type: FieldType.IMAGE,   required: true },
      { key: 'title',      label: 'Title',           type: FieldType.TEXT,    required: true },
      { key: 'subtitle',   label: 'Subtitle',        type: FieldType.TEXT },
      { key: 'description',label: 'Description',     type: FieldType.RICHTEXT },
      { key: 'price',      label: 'Price (BGN)',     type: FieldType.NUMBER,  required: true },
      { key: 'themeColor', label: 'Theme Color',     type: FieldType.COLOR },
    ],
  });

  // 2) Title + List
  const list = await upsertTemplate({
    key: 'title-list',
    name: 'Title + Bullet List',
    description: 'Headline with a bullet list; optional side image.',
    fields: [
      { key: 'title',  label: 'Title',     type: FieldType.TEXT,   required: true },
      { key: 'items',  label: 'Items',     type: FieldType.TEXT,   isArray: true, required: true },
      { key: 'image',  label: 'Side Image',type: FieldType.IMAGE },
      { key: 'accent', label: 'Accent',    type: FieldType.SELECT, config: { options: ['red','amber','emerald','sky'] } },
    ],
  });

  // 3) Two Image Promo
  const two = await upsertTemplate({
    key: 'two-image-promo',
    name: 'Two Image Promo',
    description: 'Split screen with two images and central text.',
    fields: [
      { key: 'leftImage',  label: 'Left Image',  type: FieldType.IMAGE, required: true },
      { key: 'rightImage', label: 'Right Image', type: FieldType.IMAGE, required: true },
      { key: 'headline',   label: 'Headline',    type: FieldType.TEXT,  required: true },
      { key: 'subline',    label: 'Subline',     type: FieldType.TEXT },
      { key: 'badge',      label: 'Badge',       type: FieldType.TEXT },
    ],
  });

  // 4) Price Board
  const board = await upsertTemplate({
    key: 'price-board',
    name: 'Price Board',
    description: 'Menu board with rows of {name, price}.',
    fields: [
      { key: 'title', label: 'Title', type: FieldType.TEXT, required: true },
      // store rows as array of objects in data; form builder will handle structure later
      { key: 'rows',  label: 'Rows',  type: FieldType.RICHTEXT, isArray: true, required: true, config: { itemSchema: { name: 'TEXT', price: 'NUMBER' } } },
      { key: 'note',  label: 'Footnote', type: FieldType.TEXT },
    ],
  });

  const menu = await upsertTemplate({
  key: 'menu',
  name: 'Menu',
  description: 'Three-column menu display with sections and pricing.',
  fields: [
    { key: 'description',      label: 'Restaurant Name',     type: FieldType.TEXT,    required: true },
    { key: 'title',           label: 'Menu Title',          type: FieldType.TEXT,    required: true },
    { key: 'firstListTitle',  label: 'First Section Title', type: FieldType.TEXT,    required: true },
    { 
      key: 'firstList', 
      label: 'First Section Items', 
      type: FieldType.TEXT, 
      required: true, 
      isArray: true,
      config: {
        itemSchema: {
          name: { type: 'TEXT', label: 'Item Name', required: true },
          price: { type: 'NUMBER', label: 'Price', required: true }
        }
      }
    },
    { key: 'secondListTitle', label: 'Second Section Title', type: FieldType.TEXT,   required: true },
    { 
      key: 'secondList', 
      label: 'Second Section Items', 
      type: FieldType.TEXT, 
      required: true, 
      isArray: true,
      config: {
        itemSchema: {
          name: { type: 'TEXT', label: 'Item Name', required: true },
          price: { type: 'NUMBER', label: 'Price', required: true }
        }
      }
    },
    { key: 'thirdListTitle',  label: 'Third Section Title',  type: FieldType.TEXT,   required: true },
    { 
      key: 'thirdList', 
      label: 'Third Section Items', 
      type: FieldType.TEXT, 
      required: true, 
      isArray: true,
      config: {
        itemSchema: {
          name: { type: 'TEXT', label: 'Item Name', required: true },
          price: { type: 'NUMBER', label: 'Price', required: true }
        }
      }
    },
  ],
});

  // Sample banners (one per template) using online images
  await prisma.banner.create({
    data: {
      templateId: hero.id,
      data: {
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1920&auto=format&fit=crop",
        title: "ПЛОВ НА ДЕНЯ",
        subtitle: "Uzbek Pilaf • Authentic",
        description: "<p>Saffron rice, tender beef, carrots & spices.</p>",
        price: 12.90,
        themeColor: "#f59e0b"
      }
    }
  });

  await prisma.banner.create({
    data: {
      templateId: list.id,
      data: {
        title: "ДНЕС ПРЕДЛАГАМЕ",
        items: ["Лагман", "Сомса", "Кебап с лук", "Чебурек"],
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1920&auto=format&fit=crop",
        accent: "emerald"
      }
    }
  });

  await prisma.banner.create({
    data: {
      templateId: two.id,
      data: {
        leftImage:  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920&auto=format&fit=crop",
        rightImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920&auto=format&fit=crop",
        headline: "ДВОЙНА ПРОМО ОФЕРТА",
        subline: "Комбо меню за двама",
        badge: "−20%"
      }
    }
  });

  await prisma.banner.create({
    data: {
      templateId: board.id,
      data: {
        title: "МЕНЮ",
        rows: [
          { name: "Плов класик", price: 12.90 },
          { name: "Лагман", price: 10.50 },
          { name: "Самса", price: 3.20 },
          { name: "Шашлик", price: 6.90 }
        ],
        note: "Цените са в лева с ДДС."
      }
    }
  });

  console.log("✅ Seeded templates + sample banners");
}

main().finally(() => prisma.$disconnect());


