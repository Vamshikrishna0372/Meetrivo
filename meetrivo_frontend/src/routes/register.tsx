import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/apiClient";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Meetrivo" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (values.name.trim().length < 2) errs.name = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.email = "Enter a valid email";
    if (values.password.length < 6) errs.password = "Minimum 6 characters";
    if (values.confirm !== values.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const username = values.email.split("@")[0] + "_" + Math.floor(Math.random() * 1000);
    
    auth.register({
      username,
      email: values.email,
      name: values.name,
      password: values.password,
    })
        .then(() => {
          toast.success("Account created — please login!");
          navigate({ to: "/login" });
        })
        .catch((err) => {
          toast.error(err.message || "Failed to create account");
        })
        .finally(() => {
          setLoading(false);
        });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start collaborating in seconds."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" placeholder="Jordan Rivera" value={values.name} error={errors.name} onChange={set("name")} />
        <Field label="Email" type="email" placeholder="you@company.com" value={values.email} error={errors.email} onChange={set("email")} />
        <Field label="Password" type="password" placeholder="••••••••" value={values.password} error={errors.password} onChange={set("password")} />
        <Field label="Confirm password" type="password" placeholder="••••••••" value={values.confirm} error={errors.confirm} onChange={set("confirm")} />
        <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
