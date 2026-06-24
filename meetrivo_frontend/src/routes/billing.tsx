import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCreditCard, FiCheck, FiDownload, FiLoader, FiAlertCircle } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import { billing as billingApi } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing & Plans — Meetrivo" }] }),
  component: BillingPage,
});

function BillingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const plansList = await billingApi.getPlans();
      setPlans(plansList || []);
      const activeSub = await billingApi.getSubscription();
      setSubscription(activeSub);
      const invoicesList = await billingApi.getInvoices();
      setInvoices(invoicesList || []);
    } catch (e: any) {
      console.warn("Failed to load billing details:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setActionLoading(planId);
    try {
      const res = await billingApi.subscribe(planId);
      toast.success(res.message || "Subscribed successfully!");
      loadBillingData();
    } catch (e: any) {
      toast.error(e.message || "Subscription failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading("cancel");
    try {
      await billingApi.cancelSubscription();
      toast.success("Subscription cancelled successfully");
      loadBillingData();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <FiLoader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Billing & Plans</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your subscription plan, invoices, and billing history.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Current Plan & Invoice History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current plan detail */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FiCreditCard className="text-primary" /> Current Subscription
            </h3>
            {subscription ? (
              <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl border border-border/60 bg-surface/30 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-lg font-bold text-foreground capitalize">{subscription.planType || "Free"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Status: <span className="font-semibold text-primary capitalize">{subscription.status || "ACTIVE"}</span>
                  </p>
                  {subscription.endsAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Renews on: {new Date(subscription.endsAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {subscription.planType !== "FREE" && (
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={actionLoading === "cancel"}
                    className="text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    {actionLoading === "cancel" ? <FiLoader className="animate-spin mr-1" /> : null}
                    Cancel Subscription
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface/30 p-4 text-sm text-muted-foreground">
                <FiAlertCircle className="h-5 w-5 text-warning" />
                <span>You are currently on the Free tier. Upgrade below to unlock premium features.</span>
              </div>
            )}
          </div>

          {/* Invoice history table */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Invoices & Receipts</h3>
            {invoices.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No invoices found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-surface/30 font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5">Invoice ID</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface/10">
                        <td className="px-4 py-3 font-medium text-foreground">{inv.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ""}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">${(inv.amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                              inv.status === "PAID"
                                ? "bg-success/15 text-success"
                                : "bg-destructive/15 text-destructive"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081'}/api/invoices/download/${inv.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
                          >
                            <FiDownload className="h-3.5 w-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Plans Selection Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Choose a Plan</h3>
            <div className="space-y-4">
              {plans.length === 0 ? (
                <div className="space-y-4">
                  {/* Hardcoded fallback plans matching backend seeds */}
                  <PlanRow
                    name="Pro Plan"
                    price="$15 / mo"
                    features={["Unlimited room duration", "Up to 100 participants", "Recording Enabled", "AI assistant summaries"]}
                    onSelect={() => handleSubscribe("pro-plan")}
                    loading={actionLoading === "pro-plan"}
                  />
                  <PlanRow
                    name="Business Plan"
                    price="$49 / mo"
                    features={["250 participants limit", "Breakout Rooms", "Whiteboard persistence", "Dedicated support"]}
                    onSelect={() => handleSubscribe("business-plan")}
                    loading={actionLoading === "business-plan"}
                  />
                </div>
              ) : (
                plans.map((p) => (
                  <PlanRow
                    key={p.id}
                    name={p.name}
                    price={`$${p.price} / mo`}
                    features={p.features || []}
                    onSelect={() => handleSubscribe(p.id)}
                    loading={actionLoading === p.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PlanRow({ name, price, features, onSelect, loading }: { name: string; price: string; features: string[]; onSelect: () => void; loading: boolean }) {
  return (
    <div className="rounded-xl border border-border/80 bg-surface/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm text-foreground">{name}</p>
        <p className="text-sm font-bold text-primary">{price}</p>
      </div>
      <ul className="text-xs text-muted-foreground space-y-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <FiCheck className="text-success shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <Button
        variant="hero"
        size="sm"
        className="w-full mt-2 cursor-pointer"
        onClick={onSelect}
        disabled={loading}
      >
        {loading ? <FiLoader className="animate-spin mr-1" /> : null}
        Subscribe
      </Button>
    </div>
  );
}
