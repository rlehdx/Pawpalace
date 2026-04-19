import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">결제가 취소되었습니다</h1>
        <p className="text-slate-600 mb-2">결제가 완료되지 않았습니다.</p>
        <p className="text-slate-500 text-sm mb-8">장바구니 상품은 유지됩니다. 다시 시도해주세요.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" asChild>
            <a href="/">홈으로 돌아가기</a>
          </Button>
          <Button size="lg" asChild>
            <a href="/cart">장바구니로 이동</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
