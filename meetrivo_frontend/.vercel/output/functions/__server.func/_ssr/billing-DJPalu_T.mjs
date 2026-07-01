import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { h as FiLoader, aa as FiCreditCard, R as FiAlertCircle, a1 as FiDownload, i as FiCheck } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-DHERenrj.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { billing } from "./apiClient-DYGeuPy0.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./Logo-zcoi619J.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function BillingPage() {
  const [plans, setPlans] = reactExports.useState([]);
  const [subscription, setSubscription] = reactExports.useState(null);
  const [invoices, setInvoices] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [actionLoading, setActionLoading] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadBillingData();
  }, []);
  const loadBillingData = async () => {
    setLoading(true);
    try {
      const plansList = await billing.getPlans();
      setPlans(plansList || []);
      const activeSub = await billing.getSubscription();
      setSubscription(activeSub);
      const invoicesList = await billing.getInvoices();
      setInvoices(invoicesList || []);
    } catch (e) {
      console.warn("Failed to load billing details:", e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubscribe = async (planId) => {
    setActionLoading(planId);
    try {
      const res = await billing.subscribe(planId);
      toast.success(res.message || "Subscribed successfully!");
      loadBillingData();
    } catch (e) {
      toast.error(e.message || "Subscription failed");
    } finally {
      setActionLoading(null);
    }
  };
  const handleCancel = async () => {
    setActionLoading("cancel");
    try {
      await billing.cancelSubscription();
      toast.success("Subscription cancelled successfully");
      loadBillingData();
    } catch (e) {
      toast.error(e.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-8 w-8 animate-spin text-primary" }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Billing & Plans" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "View your subscription plan, invoices, and billing history." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiCreditCard, { className: "text-primary" }),
            " Current Subscription"
          ] }),
          subscription ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col justify-between gap-4 rounded-xl border border-border/60 bg-surface/30 p-4 sm:flex-row sm:items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-foreground capitalize", children: subscription.planType || "Free" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                "Status: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary capitalize", children: subscription.status || "ACTIVE" })
              ] }),
              subscription.endsAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                "Renews on: ",
                new Date(subscription.endsAt).toLocaleDateString()
              ] })
            ] }),
            subscription.planType !== "FREE" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: handleCancel, disabled: actionLoading === "cancel", className: "text-destructive hover:bg-destructive/10 cursor-pointer", children: [
              actionLoading === "cancel" ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "animate-spin mr-1" }) : null,
              "Cancel Subscription"
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-3 rounded-xl bg-surface/30 p-4 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiAlertCircle, { className: "h-5 w-5 text-warning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "You are currently on the Free tier. Upgrade below to unlock premium features." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-4", children: "Invoices & Receipts" }),
          invoices.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center py-6", children: "No invoices found" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border bg-surface/30 font-semibold uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Invoice ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-right", children: "Receipt" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: invoices.map((inv) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium text-foreground", children: inv.id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 font-semibold text-foreground", children: [
                "$",
                (inv.amount || 0).toFixed(2)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${inv.status === "PAID" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`, children: inv.status }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `${"http://localhost:8081"}/api/invoices/download/${inv.id}`, className: "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiDownload, { className: "h-3.5 w-3.5" }) }) })
            ] }, inv.id)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-4", children: "Choose a Plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: plans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PlanRow, { name: "Pro Plan", price: "$15 / mo", features: ["Unlimited room duration", "Up to 100 participants", "Recording Enabled", "AI assistant summaries"], onSelect: () => handleSubscribe("pro-plan"), loading: actionLoading === "pro-plan" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PlanRow, { name: "Business Plan", price: "$49 / mo", features: ["250 participants limit", "Breakout Rooms", "Whiteboard persistence", "Dedicated support"], onSelect: () => handleSubscribe("business-plan"), loading: actionLoading === "business-plan" })
        ] }) : plans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(PlanRow, { name: p.name, price: `$${p.price} / mo`, features: p.features || [], onSelect: () => handleSubscribe(p.id), loading: actionLoading === p.id }, p.id)) })
      ] }) })
    ] })
  ] });
}
function PlanRow({
  name,
  price,
  features,
  onSelect,
  loading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/80 bg-surface/30 p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm text-foreground", children: name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-primary", children: price })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-xs text-muted-foreground space-y-1", children: features.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "text-success shrink-0" }),
      " ",
      f
    ] }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "hero", size: "sm", className: "w-full mt-2 cursor-pointer", onClick: onSelect, disabled: loading, children: [
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "animate-spin mr-1" }) : null,
      "Subscribe"
    ] })
  ] });
}
export {
  BillingPage as component
};
