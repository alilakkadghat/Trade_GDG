import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — TradeBot" }] }),
});

const roles = ["Exporter", "CHA (Customs House Agent)", "Freight Forwarder"] as const;

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<(typeof roles)[number]>("Exporter");

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

        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/" });
          }}
        >
          {[
            { label: "Full name", placeholder: "Rohan Mehta" },
            { label: "Work email", placeholder: "rohan@your-company.in", type: "email" },
            { label: "Password", placeholder: "••••••••", type: "password" },
            { label: "Company name", placeholder: "Your export company" },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {f.label}
              </label>
              <input
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                className="w-full mt-2 bg-transparent text-sm text-foreground pb-2 outline-none border-b-2 border-ghost focus:border-secondary placeholder:text-muted-foreground/60"
              />
            </div>
          ))}

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
            className="w-full px-4 py-2.5 rounded-md bg-primary-container text-primary-foreground text-sm font-medium hover:bg-primary"
          >
            Create workspace
          </button>
        </form>

        <p className="mt-8 text-xs text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-on-secondary-container hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
