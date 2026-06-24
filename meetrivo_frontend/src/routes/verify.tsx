import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/apiClient";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify email — Meetrivo" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your verification email link.");
      return;
    }

    auth
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully. You can now log in to your account.");
        toast.success("Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Email verification failed. The token may be invalid or expired.");
        toast.error(err.message || "Verification failed");
      });
  }, [token]);

  return (
    <AuthLayout
      title={
        status === "loading"
          ? "Verifying your email"
          : status === "success"
            ? "Email verified!"
            : "Verification failed"
      }
      subtitle={
        status === "loading"
          ? "Please wait while we confirm your email address..."
          : status === "success"
            ? "Thank you for verifying your email address."
            : "We couldn't verify your email address."
      }
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-6 py-4 text-center">
        {status === "loading" && (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary animate-spin">
            <FiLoader className="h-8 w-8" />
          </span>
        )}

        {status === "success" && (
          <>
            <span className="grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
              <FiCheck className="h-8 w-8" />
            </span>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button asChild variant="hero" className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <span className="grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive">
              <FiX className="h-8 w-8" />
            </span>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button asChild variant="glass" className="w-full">
              <Link to="/login">Back to Login</Link>
            </Button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
