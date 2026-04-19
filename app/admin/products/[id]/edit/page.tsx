// app/admin/products/[id]/edit/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AdminProductEditForm from "./EditForm";

export default async function AdminProductEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("pawpalace_products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">상품 수정</h1>
      <AdminProductEditForm product={product} />
    </div>
  );
}
