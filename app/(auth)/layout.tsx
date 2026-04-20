export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="font-display text-3xl font-bold text-slate-900">
            Paw<span className="text-amber-500">Palace</span>
          </a>
        </div>
        {children}
      </div>
    </div>
  );
}
