import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/apiClient";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — Meetrivo" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!token) errs.token = "Missing reset token. Please use the link from your email.";
    if (values.password.length < 6) errs.password = "Minimum 6 characters";
    if (values.confirm !== values.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    auth
      .resetPassword(token, values.password)
      .then(() => {
        setDone(true);
        toast.success("Password reset successfully!");
        setTimeout(() => navigate({ to: "/login" }), 2000);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to reset password. Token may be expired.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout
      title={done ? "Password updated!" : "Set new password"}
      subtitle={
        done
          ? "You'll be redirected to login shortly."
          : "Choose a strong password for your account."
      }
      footer={
        <Link to="/login" className="font-medium text-primary hover:underline">
          Back to login
        </Link>
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success text-2xl">
            ✓
          </span>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. Redirecting you to login...
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {!token && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Invalid or missing reset token. Please request a new password reset link.
            </p>
          )}
          <Field
            label="New password"
            type="password"
            placeholder="••••••••"
            value={values.password}
            error={errors.password}
            onChange={set("password")}
          />
          <Field
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            value={values.confirm}
            error={errors.confirm}
            onChange={set("confirm")}
          />
          <Button
            variant="hero"
            className="w-full"
            size="lg"
            type="submit"
            disabled={loading || !token}
          >
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
