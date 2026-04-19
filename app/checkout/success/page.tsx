import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">결제 완료!</h1>
        <p className="text-slate-600 mb-2">주문이 성공적으로 접수되었습니다.</p>
        <p className="text-slate-500 text-sm mb-8">확인 이메일이 발송됩니다.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" asChild>
            <a href="/account/orders">주문 확인</a>
          </Button>
          <Button size="lg" asChild>
            <a href="/">계속 쇼핑하기</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
