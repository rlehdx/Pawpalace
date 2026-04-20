import type { MetadataRoute } from "next";
import { CATEGORIES, NAV_ITEMS } from "@/lib/data";
import { ALL_DUMMY_PRODUCTS } from "@/lib/dummy";

const BASE_URL = "https://pawpalace.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/sale`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/category/${cat.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const subCategoryPages: MetadataRoute.Sitemap = NAV_ITEMS.flatMap((item) =>
    (item.children ?? []).map((child) => ({
      url: `${BASE_URL}${child.href}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  );

  const productPages: MetadataRoute.Sitemap = ALL_DUMMY_PRODUCTS.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...subCategoryPages, ...productPages];
}
