// app/admin/products/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("pawpalace_products")
    .select("id, name, price, stock, badge, is_active, images")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-warm"
        >
          <Plus size={16} /> 상품 등록
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">상품명</th>
              <th className="text-left px-6 py-4 font-medium">가격</th>
              <th className="text-left px-6 py-4 font-medium">재고</th>
              <th className="text-left px-6 py-4 font-medium">뱃지</th>
              <th className="text-left px-6 py-4 font-medium">상태</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <span className="font-medium text-slate-900 line-clamp-1">{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold">${Number(product.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${product.stock < 5 ? "text-red-600" : "text-slate-700"}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 capitalize">
                      {product.badge}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {product.is_active ? "활성" : "비활성"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </Link>
                    <form action={deleteProduct.bind(null, product.id)}>
                      <button
                        type="submit"
                        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
