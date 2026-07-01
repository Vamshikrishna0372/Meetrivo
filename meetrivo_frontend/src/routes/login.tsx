import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Field } from "@/components/shared/Field";
import { Button } from "@/components/ui/button";

import { apiFetch, auth } from "@/lib/apiClient";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Meetrivo" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const userStr = params.get("user");
      const error = params.get("error");
      
      if (error) {
        toast.error(decodeURIComponent(error));
      } else if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          localStorage.setItem("meetrivo_token", token);
          localStorage.setItem("meetrivo_user", JSON.stringify(user));
          toast.success("Welcome back to Meetrivo");
          
          if (user.role === "SUPER_ADMIN") {
            navigate({ to: "/admin" });
          } else if (user.role === "ORGANIZATION_OWNER" || user.role === "ORGANIZATION_ADMIN" || user.role === "TEAM_MANAGER") {
            navigate({ to: "/organizations" });
          } else if (user.role === "GUEST") {
            navigate({ to: "/join" });
          } else {
            navigate({ to: "/dashboard" });
          }
        } catch (e) {
          toast.error("Failed to process social login");
        }
      }
    }
  }, []);

  const handleOAuthLogin = (provider: 'google' | 'microsoft' | 'github') => {
    window.location.href = auth.getOAuthUrl(provider);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.email = "Enter a valid email";
    if (values.password.length < 6) errs.password = "Minimum 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    apiFetch<{ token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ login: values.email, password: values.password }),
    })
      .then((data) => {
        localStorage.setItem("meetrivo_token", data.token);
        localStorage.setItem("meetrivo_user", JSON.stringify(data.user));
        toast.success("Welcome back to Meetrivo");
        const role = data.user?.role;
        if (role === "SUPER_ADMIN") {
          navigate({ to: "/admin" });
        } else if (role === "ORGANIZATION_OWNER" || role === "ORGANIZATION_ADMIN" || role === "TEAM_MANAGER") {
          navigate({ to: "/organizations" });
        } else if (role === "GUEST") {
          navigate({ to: "/join" });
        } else {
          navigate({ to: "/dashboard" });
        }
      })
      .catch((err) => {
        toast.error(err.message || "Invalid credentials");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to your workspace."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
        <Button variant="hero" className="w-full" size="lg" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-background px-3 text-xs text-muted-foreground uppercase">
            Or continue with
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="glass"
            onClick={() => handleOAuthLogin("google")}
            className="flex items-center justify-center gap-2 text-xs"
          >
            Google
          </Button>
          <Button
            type="button"
            variant="glass"
            onClick={() => handleOAuthLogin("github")}
            className="flex items-center justify-center gap-2 text-xs"
          >
            GitHub
          </Button>
          <Button
            type="button"
            variant="glass"
            onClick={() => handleOAuthLogin("microsoft")}
            className="flex items-center justify-center gap-2 text-xs"
          >
            Microsoft
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
