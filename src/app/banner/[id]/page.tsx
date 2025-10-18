import BannerRenderer from "@/components/BannerRenderer";
import { signBannerMedia } from "@/lib/media/signBannerMedia";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()

export const revalidate = 0;

export default async function BannerPage({ params }: { params: { id: string } }) {
  const banner = await prisma.banner.findUnique({
    where: { id: params.id },
    include: { template: { include: { fields: true } } },
  });

  if (!banner) return <div style={{ padding: 24 }}>Not found</div>;

  // Sign all IMAGE fields before render
  const signedData = await signBannerMedia(banner.template, banner.data);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <BannerRenderer templateKey={banner.template.key} data={signedData} />
    </div>
  );
}
