import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-bold text-xl">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "AXIS"}
          </span>
        </Link>

        <blockquote className="space-y-2">
          <p className="text-lg font-medium leading-relaxed">
            Technology that stays with you when you need a point of support.
          </p>
          <footer className="text-sm opacity-75">AXIS · Logic Gears</footer>
        </blockquote>

        <div className="text-xs opacity-50">© 2026 AXIS · Logic Gears</div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
