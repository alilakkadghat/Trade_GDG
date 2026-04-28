"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Signed in successfully!");
      router.replace(redirectTo || "/overview");
      router.refresh();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface">
      {/* Editorial left panel */}
      <div className="hidden lg:flex flex-col justify-between p-14 bg-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary-foreground text-primary grid place-items-center font-semibold">
            T
          </div>
          <div>
            <div className="text-sm font-semibold">TradeBot</div>
            <div className="text-[11px] uppercase tracking-wider text-primary-foreground/60">
              Export Intelligence
            </div>
          </div>
        </div>

        <div className="max-w-md">
          <p className="text-[11px] uppercase tracking-[0.18em] text-primary-foreground/60">
            The Sovereign Ledger
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight leading-tight">
            India's customs cleared <span className="text-secondary-container">$770B</span> last
            year. 14% of consignments held for documentation defects.
          </h1>
          <p className="mt-6 text-sm text-primary-foreground/70 leading-relaxed">
            TradeBot is the intelligence layer between your shipping desk and the world's customs
            authorities. Cross-validate documents, decode destination compliance, and resolve delays
            with playbooks that ship.
          </p>
        </div>

        <div className="text-[11px] text-primary-foreground/50">© 2026 TradeBot · Mumbai</div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-semibold">
              T
            </div>
            <div className="text-sm font-semibold">TradeBot</div>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to your export intelligence workspace.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 bg-transparent text-sm text-foreground pb-2 outline-none border-b-2 border-ghost focus:border-secondary"
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <a className="text-[11px] text-on-secondary-container hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 bg-transparent text-sm text-foreground pb-2 outline-none border-b-2 border-ghost focus:border-secondary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-xs text-muted-foreground text-center">
            New to TradeBot?{" "}
            <Link href="/signup" className="text-on-secondary-container hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
