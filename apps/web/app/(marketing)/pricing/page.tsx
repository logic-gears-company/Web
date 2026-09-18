import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/lib/stripe";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="container py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Start free. Scale as you grow. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative rounded-2xl border p-8 flex flex-col",
              plan.popular
                ? "border-primary shadow-lg shadow-primary/10 bg-primary/5"
                : "border-border bg-card"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">
                  ${(plan.priceMonthly / 100).toFixed(0)}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {plan.priceYearly > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  or ${(plan.priceYearly / 100).toFixed(0)}/year (save{" "}
                  {Math.round(
                    (1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100
                  )}
                  %)
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
              asChild
            >
              <Link href={plan.priceMonthly === 0 ? "/register" : "/register"}>
                {plan.priceMonthly === 0
                  ? "Get started free"
                  : "Start free trial"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground mt-12">
        All paid plans include a 14-day free trial. No credit card required to start.
      </p>
    </div>
  );
}
