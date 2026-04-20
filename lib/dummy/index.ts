import { DOG_PRODUCTS } from "./dog";
import { CAT_PRODUCTS } from "./cat";
import { BIRD_PRODUCTS } from "./bird";
import { FISH_PRODUCTS } from "./fish";
import { SMALL_PET_PRODUCTS } from "./small-pet";
import type { Product } from "@/lib/types";

export { DOG_PRODUCTS } from "./dog";
export { CAT_PRODUCTS } from "./cat";
export { BIRD_PRODUCTS } from "./bird";
export { FISH_PRODUCTS } from "./fish";
export { SMALL_PET_PRODUCTS } from "./small-pet";

export const ALL_DUMMY_PRODUCTS: Product[] = [
  ...DOG_PRODUCTS,
  ...CAT_PRODUCTS,
  ...BIRD_PRODUCTS,
  ...FISH_PRODUCTS,
  ...SMALL_PET_PRODUCTS,
];

/** 카테고리 ID로 더미 상품 조회 */
export function getDummyByCategory(categoryId: string): Product[] {
  return ALL_DUMMY_PRODUCTS.filter((p) => p.category === categoryId);
}

/** 카테고리 ID + 태그(sub)로 더미 상품 필터링. 매칭 없으면 카테고리 전체 반환 */
export function getDummyByCategorySub(categoryId: string, sub: string): Product[] {
  const byCategory = getDummyByCategory(categoryId);
  const filtered = byCategory.filter((p) => p.tags.some((t) => t.includes(sub)));
  return filtered.length > 0 ? filtered : byCategory;
}
