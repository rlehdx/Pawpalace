// app/admin/products/[id]/edit/EditForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct, uploadProductImage } from "../../../actions";
import { Button } from "@/components/ui/Button";
import { Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  stock: number;
  description?: string | null;
  badge?: string | null;
  free_shipping?: boolean;
  images?: string[];
}

export default function AdminProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(product.images?.[0] ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const url = await uploadProductImage(fd);
      setImageUrl(url);
    } catch {
      alert("이미지 업로드 실패");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("image_url", imageUrl);
    try {
      await updateProduct(product.id, fd);
      router.push("/admin/products");
    } catch (err) {
      alert("수정 실패: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 flex flex-col gap-6">
      {/* 이미지 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">상품 이미지</label>
        <div className="flex items-center gap-4">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="상품 이미지" className="w-24 h-24 rounded-xl object-cover border border-slate-200" />
          ) : (
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <Upload size={24} />
            </div>
          )}
          <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
            {uploading ? "업로드 중..." : "이미지 변경"}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">상품명 *</label>
        <input name="name" required defaultValue={product.name} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">판매가 ($) *</label>
          <input name="price" type="number" step="0.01" min="0" required defaultValue={product.price} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">정가 ($)</label>
          <input name="originalPrice" type="number" step="0.01" min="0" defaultValue={product.original_price ?? ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">재고 *</label>
        <input name="stock" type="number" min="0" required defaultValue={product.stock} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">상품 설명</label>
        <textarea name="description" rows={3} defaultValue={product.description ?? ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">뱃지</label>
        <select name="badge" defaultValue={product.badge ?? ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm">
          <option value="">없음</option>
          <option value="new">신상품</option>
          <option value="sale">세일</option>
          <option value="bestseller">베스트셀러</option>
          <option value="limited">한정판</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input type="checkbox" name="free_shipping" id="free_shipping_edit" defaultChecked={product.free_shipping} className="w-4 h-4 rounded accent-amber-500" />
        <label htmlFor="free_shipping_edit" className="text-sm font-medium text-slate-700">무료 배송</label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>취소</Button>
        <Button type="submit" loading={submitting}>저장하기</Button>
      </div>
    </form>
  );
}
