"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const roles = ["Exporter", "CHA (Customs House Agent)", "Freight Forwarder"] as const;

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<(typeof roles)[number]>("Exporter");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !companyName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            role: role,
          },
        },
      });
      if (error) throw error;
      if (!data.session) {
        toast.success("Account created! Please check your email to verify your account.");
        router.replace("/login");
      } else {
        toast.success("Account created successfully! Welcome to TradeBot.");
        router.replace("/overview");
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-semibold">
            T
          </div>
          <div>
            <div className="text-sm font-semibold">TradeBot</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Export Intelligence
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Create your workspace
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Onboard your company in under two minutes.
        </p>

        <form className="mt-10 space-y-6" onSubmit={handleSignup}>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Full name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Rohan Mehta"
              className="w-full mt-2 bg-transparent text-sm text-foreground pb-2 outline-none border-b-2 border-ghost focus:border-secondary placeholder:text-muted-foreground/60"
              required
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Work email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rohan@your-company.in"
              className="w-full mt-2 bg-transparent text-sm text-foreground pb-2 outline-none border-b-2 border-ghost focus:border-secondary placeholder:text-muted-foreground/60"
              required
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-2 bg-transparent text-sm text-foreground pb-2 outline-none border-b-2 border-ghost focus:border-secondary placeholder:text-muted-foreground/60"
              required
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Company name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your export company"
              className="w-full mt-2 bg-transparent text-sm text-foreground pb-2 outline-none border-b-2 border-ghost focus:border-secondary placeholder:text-muted-foreground/60"
              required
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Your role
            </label>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {roles.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`text-left px-4 py-3 rounded-md text-sm transition-colors ${
                    role === r
                      ? "bg-secondary-container text-on-secondary-container font-medium"
                      : "bg-surface-low text-foreground hover:bg-surface-container"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating workspace..." : "Create workspace"}
          </button>
        </form>

        <p className="mt-8 text-xs text-muted-foreground text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-on-secondary-container hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
