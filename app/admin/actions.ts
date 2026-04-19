"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ——— 상품 ———

export async function createProduct(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const slug = (formData.get("name") as string)
    .toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const price = parseFloat(formData.get("price") as string);
  const originalPrice = formData.get("originalPrice")
    ? parseFloat(formData.get("originalPrice") as string)
    : null;
  const stock = parseInt(formData.get("stock") as string, 10);
  const description = formData.get("description") as string;
  const animalCategoryId = formData.get("animal_category_id") as string;
  const productCategoryId = formData.get("product_category_id") as string;
  const badge = (formData.get("badge") as string) || null;
  const freeShipping = formData.get("free_shipping") === "on";
  const imageUrl = formData.get("image_url") as string;

  const { error } = await supabase.from("pawpalace_products").insert({
    name,
    slug,
    price,
    original_price: originalPrice,
    stock,
    description,
    animal_category_id: animalCategoryId,
    product_category_id: productCategoryId,
    badge,
    free_shipping: freeShipping,
    images: imageUrl ? [imageUrl] : [],
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const price = parseFloat(formData.get("price") as string);
  const originalPrice = formData.get("originalPrice")
    ? parseFloat(formData.get("originalPrice") as string)
    : null;
  const stock = parseInt(formData.get("stock") as string, 10);
  const imageUrl = formData.get("image_url") as string;

  const { error } = await supabase
    .from("pawpalace_products")
    .update({
      name: formData.get("name") as string,
      price,
      original_price: originalPrice,
      stock,
      description: formData.get("description") as string,
      badge: (formData.get("badge") as string) || null,
      free_shipping: formData.get("free_shipping") === "on",
      images: imageUrl ? [imageUrl] : [],
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("pawpalace_products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

// ——— 주문 상태 변경 ———

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("pawpalace_orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

// ——— 쿠폰 ———

export async function createCoupon(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.from("pawpalace_coupons").insert({
    code: (formData.get("code") as string).toUpperCase(),
    discount_type: formData.get("discount_type") as string,
    discount_value: parseFloat(formData.get("discount_value") as string),
    min_order_amount: parseFloat((formData.get("min_order_amount") as string) || "0"),
    max_uses: formData.get("max_uses") ? parseInt(formData.get("max_uses") as string, 10) : null,
    expires_at: (formData.get("expires_at") as string) || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(id: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from("pawpalace_coupons")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/coupons");
}

// ——— 이미지 업로드 ———

export async function uploadProductImage(formData: FormData): Promise<string> {
  const supabase = createClient();
  const file = formData.get("file") as File;
  const ext = file.name.split(".").pop();
  const path = `products/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("pawpalace-products")
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("pawpalace-products").getPublicUrl(path);
  return data.publicUrl;
}
