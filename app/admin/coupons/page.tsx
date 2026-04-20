import { createClient } from "@/lib/supabase/server";
import { createCoupon, toggleCoupon } from "../actions";

export default async function AdminCouponsPage() {
  const supabase = createClient();
  const { data: coupons } = await supabase
    .from("pawpalace_coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">Coupons</h1>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8">
        <h2 className="font-semibold text-slate-900 mb-4">Create New Coupon</h2>
        <form action={createCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Coupon Code *</label>
            <input name="code" required placeholder="SUMMER20" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm uppercase" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Discount Type *</label>
            <select name="discount_type" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm">
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Discount Value *</label>
            <input name="discount_value" type="number" step="0.01" min="0" required placeholder="20" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Min. Order Amount ($)</label>
            <input name="min_order_amount" type="number" step="0.01" min="0" defaultValue="0" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Max Uses</label>
            <input name="max_uses" type="number" min="1" placeholder="Unlimited" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Expires At</label>
            <input name="expires_at" type="date" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 outline-none text-sm" />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors">
              Create Coupon
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">Code</th>
              <th className="text-left px-6 py-4 font-medium">Discount</th>
              <th className="text-left px-6 py-4 font-medium">Used / Max</th>
              <th className="text-left px-6 py-4 font-medium">Expires</th>
              <th className="text-left px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((coupon) => (
              <tr key={coupon.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-slate-900">{coupon.code}</td>
                <td className="px-6 py-4">
                  {coupon.discount_type === "percent"
                    ? `${coupon.discount_value}%`
                    : `$${Number(coupon.discount_value).toFixed(2)}`}
                </td>
                <td className="px-6 py-4">{coupon.used_count} / {coupon.max_uses ?? "∞"}</td>
                <td className="px-6 py-4 text-slate-500">
                  {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("en-US") : "—"}
                </td>
                <td className="px-6 py-4">
                  <form action={toggleCoupon.bind(null, coupon.id, !coupon.is_active)}>
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        coupon.is_active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
