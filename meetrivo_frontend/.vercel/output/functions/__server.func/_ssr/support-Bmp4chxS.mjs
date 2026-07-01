import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { k as FiHelpCircle, h as FiLoader, l as FiSend } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-DHERenrj.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
import { support } from "./apiClient-DYGeuPy0.mjs";
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
function SupportPage() {
  const [tickets, setTickets] = reactExports.useState([]);
  const [subject, setSubject] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [priority, setPriority] = reactExports.useState("NORMAL");
  const [loading, setLoading] = reactExports.useState(true);
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadTickets();
  }, []);
  const loadTickets = async () => {
    setLoading(true);
    try {
      const list = await support.getTickets();
      setTickets(list || []);
    } catch (e) {
      console.warn("Failed to load tickets:", e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      await support.createTicket({
        subject,
        description,
        priority
      });
      toast.success("Support ticket submitted successfully!");
      setSubject("");
      setDescription("");
      setPriority("NORMAL");
      loadTickets();
    } catch (err) {
      toast.error(err.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Customer Support" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Submit support tickets and track helpdesk updates." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2 space-y-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiHelpCircle, { className: "text-primary" }),
          " Ticket History"
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-6 w-6 animate-spin text-primary" }) }) : tickets.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground py-6", children: "No tickets submitted yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: tickets.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-surface/30 p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm text-foreground", children: t.subject }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: t.description })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase ${t.status === "OPEN" ? "bg-primary/15 text-primary" : t.status === "RESOLVED" ? "bg-success/15 text-success" : "bg-surface text-muted-foreground"}`, children: t.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] text-muted-foreground/75 pt-1 border-t border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Priority: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: t.priority })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Submitted: ",
              t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Today"
            ] })
          ] })
        ] }, t.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-4", children: "Create Ticket" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subject", placeholder: "Brief summary of the issue", value: subject, onChange: (e) => setSubject(e.target.value), required: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), placeholder: "Provide details about the issue...", rows: 4, required: true, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Priority" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: priority, onChange: (e) => setPriority(e.target.value), className: "w-full h-10 rounded-xl border border-border bg-background/60 px-3 text-xs outline-none focus:border-primary cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "LOW", children: "LOW" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "NORMAL", children: "NORMAL" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HIGH", children: "HIGH" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", variant: "hero", className: "w-full cursor-pointer", disabled: submitting, children: [
            submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiSend, { className: "mr-1" }),
            "Submit Ticket"
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  SupportPage as component
};
