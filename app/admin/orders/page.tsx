import { createClient } from "@/lib/supabase/server";
import { updateOrderStatus } from "../actions";

const ORDER_STATUSES = [
  { value: "pending",   label: "대기중",   color: "bg-slate-100 text-slate-600" },
  { value: "paid",      label: "결제완료", color: "bg-blue-100 text-blue-700" },
  { value: "shipping",  label: "배송중",   color: "bg-amber-100 text-amber-700" },
  { value: "delivered", label: "배송완료", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "취소됨",   color: "bg-red-100 text-red-700" },
  { value: "refunded",  label: "환불됨",   color: "bg-purple-100 text-purple-700" },
];

export default async function AdminOrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("pawpalace_orders")
    .select("id, status, total_amount, created_at, user_id")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-8">주문 관리</h1>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-medium">주문 ID</th>
              <th className="text-left px-6 py-4 font-medium">금액</th>
              <th className="text-left px-6 py-4 font-medium">날짜</th>
              <th className="text-left px-6 py-4 font-medium">상태 변경 (원클릭)</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-600">{order.id.slice(0, 12)}...</td>
                <td className="px-6 py-4 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(order.created_at).toLocaleDateString("ko-KR")}</td>
                <td className="px-6 py-4">
                  {/* 원클릭 상태 변경 버튼들 */}
                  <div className="flex flex-wrap gap-1.5">
                    {ORDER_STATUSES.map(({ value, label, color }) => (
                      <form key={value} action={updateOrderStatus.bind(null, order.id, value)}>
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border-2 ${
                            order.status === value
                              ? `${color} border-current opacity-100 ring-2 ring-offset-1 ring-current`
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                          }`}
                        >
                          {label}
                        </button>
                      </form>
                    ))}
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
