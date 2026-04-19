import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">Payment cancelled</h1>
        <p className="text-slate-600 mb-2">Your payment was not completed.</p>
        <p className="text-slate-500 text-sm mb-8">Your cart items are saved. Feel free to try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" asChild>
            <a href="/">Go home</a>
          </Button>
          <Button size="lg" asChild>
            <a href="/cart">View cart</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
