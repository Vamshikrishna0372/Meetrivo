import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiMessageSquare, FiSend, FiLoader, FiStar } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import { feedback as feedbackApi } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Meetrivo" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const list = await feedbackApi.getAll();
      setFeedbacks(list || []);
    } catch (e: any) {
      console.warn("Failed to load feedbacks:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.submit({
        rating,
        comment,
      });
      toast.success("Thank you for your feedback!");
      setComment("");
      setRating(5);
      loadFeedbacks();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Feedback</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Let us know how your meeting went or leave suggestions for the platform.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Submit Feedback Form */}
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Leave Feedback</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-center">
                <label className="text-xs font-semibold text-muted-foreground">Rating</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const filled = hoverRating !== null ? val <= hoverRating : val <= rating;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <FiStar
                          className={`h-7 w-7 transition-colors ${
                            filled ? "fill-warning text-warning" : "text-muted-foreground/60"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full cursor-pointer" disabled={submitting}>
                {submitting ? <FiLoader className="animate-spin mr-1" /> : <FiSend className="mr-1" />}
                Submit Feedback
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side: Feedbacks History */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FiMessageSquare className="text-primary" /> Past Feedbacks
            </h3>
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <FiLoader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : feedbacks.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">No feedback submitted yet</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((f) => (
                  <div key={f.id} className="rounded-xl border border-border/60 bg-surface/30 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <FiStar
                            key={val}
                            className={`h-4.5 w-4.5 ${
                              val <= f.rating ? "fill-warning text-warning" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-muted-foreground/75">
                        {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    {f.comment && <p className="text-xs text-foreground/90 mt-1">{f.comment}</p>}
                    <div className="text-[9px] text-muted-foreground/70 text-right">
                      {f.meetingId ? `Meeting: ${f.meetingId}` : "Platform Feedback"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
