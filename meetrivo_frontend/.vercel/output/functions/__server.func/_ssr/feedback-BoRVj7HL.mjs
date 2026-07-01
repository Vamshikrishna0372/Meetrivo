import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a2 as FiStar, h as FiLoader, l as FiSend, z as FiMessageSquare } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-DHERenrj.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { feedback } from "./apiClient-DYGeuPy0.mjs";
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
function FeedbackPage() {
  const [feedbacks, setFeedbacks] = reactExports.useState([]);
  const [rating, setRating] = reactExports.useState(5);
  const [comment, setComment] = reactExports.useState("");
  const [hoverRating, setHoverRating] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadFeedbacks();
  }, []);
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const list = await feedback.getAll();
      setFeedbacks(list || []);
    } catch (e) {
      console.warn("Failed to load feedbacks:", e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedback.submit({
        rating,
        comment
      });
      toast.success("Thank you for your feedback!");
      setComment("");
      setRating(5);
      loadFeedbacks();
    } catch (err) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Feedback" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Let us know how your meeting went or leave suggestions for the platform." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1 space-y-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-4", children: "Leave Feedback" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Rating" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2", children: [1, 2, 3, 4, 5].map((val) => {
              const filled = hoverRating !== null ? val <= hoverRating : val <= rating;
              return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setRating(val), onMouseEnter: () => setHoverRating(val), onMouseLeave: () => setHoverRating(null), className: "text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiStar, { className: `h-7 w-7 transition-colors ${filled ? "fill-warning text-warning" : "text-muted-foreground/60"}` }) }, val);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Comment (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: comment, onChange: (e) => setComment(e.target.value), placeholder: "Share your thoughts...", rows: 4, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", variant: "hero", className: "w-full cursor-pointer", disabled: submitting, children: [
            submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "animate-spin mr-1" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiSend, { className: "mr-1" }),
            "Submit Feedback"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2 space-y-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold mb-4 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiMessageSquare, { className: "text-primary" }),
          " Past Feedbacks"
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-6 w-6 animate-spin text-primary" }) }) : feedbacks.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground py-6", children: "No feedback submitted yet" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: feedbacks.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-surface/30 p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((val) => /* @__PURE__ */ jsxRuntimeExports.jsx(FiStar, { className: `h-4.5 w-4.5 ${val <= f.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}` }, val)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground/75", children: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "" })
          ] }),
          f.comment && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/90 mt-1", children: f.comment }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground/70 text-right", children: f.meetingId ? `Meeting: ${f.meetingId}` : "Platform Feedback" })
        ] }, f.id)) })
      ] }) })
    ] })
  ] });
}
export {
  FeedbackPage as component
};
