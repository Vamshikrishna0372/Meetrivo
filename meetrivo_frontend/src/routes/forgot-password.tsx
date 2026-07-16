import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/apiClient";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Meetrivo" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setError("");
    setLoading(true);
    
    auth.forgotPassword(email)
        .then(() => {
          setSent(true);
        })
        .catch((err) => {
          setError(err.message || "Failed to send reset link");
        })
        .finally(() => {
          setLoading(false);
        });
  };

  return (
    <AuthLayout
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? "We've sent a recovery link to your email."
          : "Enter your email and we'll send you a reset link."
      }
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 py-4 text-center"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
            <FiCheck className="h-7 w-7" />
          </span>
          <p className="text-sm text-muted-foreground">
            If <span className="text-foreground">{email}</span> matches an account, a reset link is on its way.
          </p>
          <Button variant="glass" className="w-full" onClick={() => setSent(false)}>
            Resend link
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field
            label="Email"
            type="email"
            placeholder="you@company.com"
            value={email}
            error={error}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
