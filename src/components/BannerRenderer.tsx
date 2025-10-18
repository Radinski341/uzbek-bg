import HeroDishBanner from "./templates/HeroDishBanner";
import TitleListBanner from "./templates/TitleListBanner";
import TwoImagePromoBanner from "./templates/TwoImagePromoBanner";
import PriceBoardBanner from "./templates/PriceBoardBanner";
import { JSX } from "react";
import MenuBanner from "./templates/MenuBanner";

export default function BannerRenderer({ templateKey, data }: { templateKey: string; data: any }) {
  const map: Record<string, (p: any) => JSX.Element> = {
    "hero-dish": (p) => <HeroDishBanner {...p} />,
    "title-list": (p) => <TitleListBanner {...p} />,
    "two-image-promo": (p) => <TwoImagePromoBanner {...p} />,
    "price-board": (p) => <PriceBoardBanner {...p} />,
    "menu": (p) => <MenuBanner {...p} />,
  };

  const Comp = map[templateKey];
  if (!Comp) return <div style={{ padding: 20 }}>Unknown template: {templateKey}</div>;
  return <Comp data={data} />;
}
