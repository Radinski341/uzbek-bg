export type Banner = {
  id: string;
  title: string;
  src: string; // can be remote URL or /banners/xxx.jpg
};

export const defaultBanners: Banner[] = [
  {
    id: "plov-special",
    title: "Plov Special",
    src: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: "lagman",
    title: "Lagman Noodles",
    src: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: "kebab",
    title: "Uzbek Kebab",
    src: "https://images.unsplash.com/photo-1448043552756-e747b7a2b2b8?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: "samsa",
    title: "Fresh Samsa",
    src: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1600&auto=format&fit=crop"
  },
  {
    id: "dessert",
    title: "Desserts & Tea",
    src: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1600&auto=format&fit=crop"
  }
];
