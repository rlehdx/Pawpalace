// app/admin/products/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, uploadProductImage } from "../../actions";
import { Button } from "@/components/ui/Button";
import { Upload } from "lucide-react";

export default function AdminProductNewPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
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
      alert("Image upload failed");
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
      await createProduct(fd);
      router.push("/admin/products");
    } catch (err) {
      alert("Failed to create product: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">Add Product</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-slate-100 p-8 flex flex-col gap-6">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
          <div className="flex items-center gap-4">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Product image" className="w-24 h-24 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                <Upload size={24} />
              </div>
            )}
            <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:border-amber-400 hover:text-amber-600 transition-colors">
              {uploading ? "Uploading..." : "Choose File"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
          <input name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Sale Price ($) *</label>
            <input name="price" type="number" step="0.01" min="0" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Original Price ($)</label>
            <input name="originalPrice" type="number" step="0.01" min="0" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock *</label>
          <input name="stock" type="number" min="0" required defaultValue={0} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea name="description" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm transition-all resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Badge</label>
          <select name="badge" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm">
            <option value="">None</option>
            <option value="new">New</option>
            <option value="sale">Sale</option>
            <option value="bestseller">Bestseller</option>
            <option value="limited">Limited</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="free_shipping" id="free_shipping" className="w-4 h-4 rounded accent-amber-500" />
          <label htmlFor="free_shipping" className="text-sm font-medium text-slate-700">Free Shipping</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" loading={submitting}>Create Product</Button>
        </div>
      </form>
    </div>
  );
}
