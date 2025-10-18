import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient

export const revalidate = 0;

export default async function BannerIndex() {
  const banners = await prisma.banner.findMany({
    include: { template: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container">
      <h1>Banners</h1>
      <table className="table">
        <thead><tr><th>Template</th><th>ID</th><th>Preview</th></tr></thead>
        <tbody>
          {banners.map(b => (
            <tr key={b.id}>
              <td>{b.template.name}</td>
              <td><code>{b.id}</code></td>
              <td><Link href={`/banner/${b.id}`}>Open Fullscreen</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
