import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiHelpCircle, FiSend, FiLoader, FiCheckCircle } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/Field";
import { support as supportApi } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — Meetrivo" }] }),
  component: SupportPage,
});

function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const list = await supportApi.getTickets();
      setTickets(list || []);
    } catch (e: any) {
      console.warn("Failed to load tickets:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Subject and description are required.");
      return;
    }
    setSubmitting(true);
    try {
      await supportApi.createTicket({
        subject,
        description,
        priority,
      });
      toast.success("Support ticket submitted successfully!");
      setSubject("");
      setDescription("");
      setPriority("NORMAL");
      loadTickets();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Customer Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit support tickets and track helpdesk updates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Side: Ticket History */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <FiHelpCircle className="text-primary" /> Ticket History
            </h3>
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <FiLoader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">No tickets submitted yet</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="rounded-xl border border-border/60 bg-surface/30 p-4 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{t.subject}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase ${
                          t.status === "OPEN"
                            ? "bg-primary/15 text-primary"
                            : t.status === "RESOLVED"
                              ? "bg-success/15 text-success"
                              : "bg-surface text-muted-foreground"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/75 pt-1 border-t border-border/40">
                      <span>Priority: <span className="font-semibold">{t.priority}</span></span>
                      <span>Submitted: {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "Today"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Create Ticket Form */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold mb-4">Create Ticket</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Subject"
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about the issue..."
                  rows={4}
                  required
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background/60 px-3 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  <option value="LOW">LOW</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>
              <Button type="submit" variant="hero" className="w-full cursor-pointer" disabled={submitting}>
                {submitting ? <FiLoader className="animate-spin mr-1" /> : <FiSend className="mr-1" />}
                Submit Ticket
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
