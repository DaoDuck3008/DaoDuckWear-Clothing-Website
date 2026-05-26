import DAODUCKWEARHero from "@/components/home/HeroSection";
import { ProductSliderSection } from "@/components/home/ProductSlider";
import DAODUCKWEARNewsletter from "@/components/home/AtelierNewsletter";

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: { url: string; isMain: boolean; color?: string }[];
}

function mapProduct(p: ApiProduct) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    images: p.images || [],
  };
}

async function getProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/products?limit=5&sort=newest`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data as ApiProduct[]).map(mapProduct);
  } catch {
    return [];
  }
}

const SECTION_TITLES = [
  "SẢN PHẨM MỚI NHẤT",
  "BỘ SƯU TẬP NỔI BẬT",
  "GỢI Ý CHO BẠN",
];

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="flex flex-col bg-white">
      <DAODUCKWEARHero />

      <main className="flex flex-col">
        {SECTION_TITLES.map((title) => (
          <ProductSliderSection
            key={title}
            title={title}
            products={products}
          />
        ))}

        <DAODUCKWEARNewsletter />
      </main>
    </div>
  );
}
