import { createClient } from "@/lib/supabase/server";
import { TrendingUp, ShoppingBag, Users, Package } from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    ordersCountResult,
    membersCountResult,
    productsCountResult,
    recentOrdersResult,
    revenueResult,
  ] = await Promise.allSettled([
    supabase.from("pawpalace_orders").select("*", { count: "exact", head: true }),
    supabase.from("pawpalace_profiles").select("*", { count: "exact", head: true }),
    supabase.from("pawpalace_products").select("*", { count: "exact", head: true }),
    supabase
      .from("pawpalace_orders")
      .select("id, status, total_amount, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("pawpalace_orders").select("total_amount").eq("status", "paid"),
  ]);

  const totalOrders = ordersCountResult.status === "fulfilled" ? ordersCountResult.value.count : null;
  const totalMembers = membersCountResult.status === "fulfilled" ? membersCountResult.value.count : null;
  const totalProducts = productsCountResult.status === "fulfilled" ? productsCountResult.value.count : null;
  const recentOrders = recentOrdersResult.status === "fulfilled" ? recentOrdersResult.value.data : null;
  const revenueData = revenueResult.status === "fulfilled" ? revenueResult.value.data : null;
  const totalRevenue = revenueData?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

  const stats = [
    { label: "총 매출", value: `$${totalRevenue.toLocaleString("en", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "총 주문", value: totalOrders ?? 0, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "총 회원", value: totalMembers ?? 0, icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "등록 상품", value: totalProducts ?? 0, icon: Package, color: "text-amber-600 bg-amber-50" },
  ];

  const statusLabel: Record<string, string> = {
    pending: "대기", paid: "결제완료", shipping: "배송중", delivered: "배송완료", cancelled: "취소", refunded: "환불"
  };
  const statusColor: Record<string, string> = {
    pending: "bg-slate-100 text-slate-600",
    paid: "bg-blue-100 text-blue-700",
    shipping: "bg-amber-100 text-amber-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
    refunded: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">대시보드</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
              <Icon size={22} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">최근 주문</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="text-left py-3 pr-4 font-medium">주문 ID</th>
                <th className="text-left py-3 pr-4 font-medium">상태</th>
                <th className="text-left py-3 pr-4 font-medium">금액</th>
                <th className="text-left py-3 font-medium">날짜</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600">{order.id.slice(0, 8)}...</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {statusLabel[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="py-3 text-slate-500">{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
