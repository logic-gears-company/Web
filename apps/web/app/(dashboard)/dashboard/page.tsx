import { auth } from "@/lib/auth";
import { prisma } from "@ai-saas/database";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Zap,
  ArrowRight,
  TrendingUp,
  Bot,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [user, conversationCount, messageCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: { include: { plan: true } } },
    }),
    prisma.conversation.count({ where: { userId: session.user.id } }),
    prisma.message.count({ where: { userId: session.user.id } }),
  ]);

  if (!user) redirect("/login");

  const plan = user.subscription?.plan;
  const tokensUsed = user.tokensUsed;
  const tokensLimit = plan?.maxTokensPerMonth ?? 50_000;
  const tokensPct = Math.min(100, (tokensUsed / tokensLimit) * 100);

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">
          Good {getTimeOfDay()}, {user.name?.split(" ")[0] ?? "there"} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Conversations"
          value={formatNumber(conversationCount)}
          icon={MessageSquare}
          href="/chat"
        />
        <StatCard
          label="Messages sent"
          value={formatNumber(messageCount)}
          icon={TrendingUp}
        />
        <StatCard
          label="Tokens used"
          value={formatNumber(tokensUsed)}
          icon={Zap}
          subtext={`of ${formatNumber(tokensLimit)}`}
        />
        <StatCard
          label="Current plan"
          value={plan?.name ?? "Free"}
          icon={TrendingUp}
          href="/billing"
        />
      </div>

      {/* Usage bar */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Token Usage</h2>
            <p className="text-sm text-muted-foreground">
              {formatNumber(tokensUsed)} / {formatNumber(tokensLimit)} tokens
              this month
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/billing">Upgrade plan</Link>
          </Button>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${tokensPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {tokensPct.toFixed(1)}% of monthly limit used
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          icon={MessageSquare}
          title="New Chat"
          description="Start a new AI conversation"
          href="/chat"
        />
        <QuickAction
          icon={Bot}
          title="Run Agent"
          description="Execute an AI agent workflow"
          href="/agents"
        />
        <QuickAction
          icon={FileText}
          title="Upload Files"
          description="Add docs to your knowledge base"
          href="/files"
        />
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  href,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  subtext?: string;
  href?: string;
}) {
  const card = (
    <div className="rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all group"
    >
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}
