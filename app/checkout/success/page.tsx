import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">Order confirmed!</h1>
        <p className="text-slate-600 mb-2">Your order has been placed successfully.</p>
        <p className="text-slate-500 text-sm mb-8">A confirmation email will be sent to you.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" asChild>
            <a href="/account/orders">View order</a>
          </Button>
          <Button size="lg" asChild>
            <a href="/">Continue shopping</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
