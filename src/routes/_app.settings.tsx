import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui-bits";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Rohan Mehta",
    email: "rohan@kanchan-exports.in",
    role: "Exporter (Owner)",
    phone: "+91 98200 12345",
  });
  const [company, setCompany] = useState({
    companyName: "Kanchan Exports Pvt Ltd",
    iecCode: "0312034567",
    gstin: "27AABCK1234F1Z5",
    apedaRcmc: "RCMC/APEDA/2024/MH/00128",
    primaryCategories: "Basmati, Spices, Cotton Yarn",
    registeredAddress: "Andheri East, Mumbai 400069",
  });
  const [notifications, setNotifications] = useState({
    criticalDocumentErrors: true,
    complianceWarnings: true,
    geopoliticalSignalsCargo: true,
    geopoliticalSignalsAll: false,
    weeklyExportDigest: true,
  });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [companyDraft, setCompanyDraft] = useState(company);

  const initial = profile.name.charAt(0).toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(draft);
    setOpen(false);
    toast.success("Profile updated");
  };

  const handleCompanySave = (e: React.FormEvent) => {
    e.preventDefault();
    setCompany(companyDraft);
    setCompanyOpen(false);
    toast.success("Company details updated");
  };

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">
      <div className="pt-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Account & workspace
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">User Settings</h2>
      </div>

      <Card>
        <div className="flex items-start gap-6">
          <div className="h-16 w-16 rounded-md bg-primary text-primary-foreground grid place-items-center text-xl font-semibold">
            {initial}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Kanchan Exports Pvt Ltd · {profile.role}
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (v) setDraft(profile);
            }}
          >
            <DialogTrigger asChild>
              <button className="px-3 py-1.5 rounded-md bg-surface-high text-sm hover:bg-surface-highest">
                Edit profile
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Update your personal details. Changes apply across the workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 pt-2">
                {(
                  [
                    { key: "name", label: "Full name", type: "text" },
                    { key: "email", label: "Email", type: "email" },
                    { key: "phone", label: "Phone", type: "tel" },
                    { key: "role", label: "Role", type: "text" },
                  ] as const
                ).map((f) => (
                  <div key={f.key}>
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      required
                      value={draft[f.key]}
                      onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                      className="mt-1.5 w-full bg-transparent text-sm text-foreground pb-2 border-b-2 border-ghost focus:border-secondary outline-none transition-colors"
                    />
                  </div>
                ))}
                <DialogFooter className="pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-surface-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-md bg-primary-container text-primary-foreground text-sm hover:bg-primary"
                  >
                    Save changes
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-sm font-semibold text-foreground">Company</h3>
          <Dialog
            open={companyOpen}
            onOpenChange={(v) => {
              setCompanyOpen(v);
              if (v) setCompanyDraft(company);
            }}
          >
            <DialogTrigger asChild>
              <button className="px-3 py-1.5 rounded-md bg-surface-high text-sm hover:bg-surface-highest">
                Edit company
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit company details</DialogTitle>
                <DialogDescription>
                  Update your registered business information for the workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCompanySave} className="space-y-4 pt-2">
                {(
                  [
                    { key: "companyName", label: "Company name" },
                    { key: "iecCode", label: "IEC Code" },
                    { key: "gstin", label: "GSTIN" },
                    { key: "apedaRcmc", label: "APEDA RCMC" },
                    { key: "primaryCategories", label: "Primary categories" },
                    { key: "registeredAddress", label: "Registered address" },
                  ] as const
                ).map((field) => (
                  <div key={field.key}>
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {field.label}
                    </label>
                    <Input
                      required
                      value={companyDraft[field.key]}
                      onChange={(e) =>
                        setCompanyDraft({ ...companyDraft, [field.key]: e.target.value })
                      }
                      className="mt-1.5 border-0 border-b-2 border-ghost rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-secondary"
                    />
                  </div>
                ))}
                <DialogFooter className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCompanyOpen(false)}
                    className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-surface-high"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-md bg-primary-container text-primary-foreground text-sm hover:bg-primary"
                  >
                    Save changes
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {[
            ["Company name", company.companyName],
            ["IEC Code", company.iecCode],
            ["GSTIN", company.gstin],
            ["APEDA RCMC", company.apedaRcmc],
            ["Primary categories", company.primaryCategories],
            ["Registered address", company.registeredAddress],
          ].map(([label, val]) => (
            <div key={label}>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {label}
              </div>
              <div className="text-sm text-foreground mt-1.5 pb-2 border-b-2 border-ghost">
                {val}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <div className="mt-5 space-y-4">
          {[
            ["Critical document errors", "criticalDocumentErrors"],
            ["Compliance warnings", "complianceWarnings"],
            ["Geopolitical signals (your cargo)", "geopoliticalSignalsCargo"],
            ["Geopolitical signals (all)", "geopoliticalSignalsAll"],
            ["Weekly export digest", "weeklyExportDigest"],
          ].map(([label, key]) => (
            <div key={label as string} className="flex items-center justify-between">
              <div className="text-sm text-foreground">{label}</div>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onCheckedChange={(checked) => {
                  setNotifications((current) => ({ ...current, [key]: checked }));
                  toast.success(`${label} ${checked ? "enabled" : "disabled"}`);
                }}
                aria-label={`Toggle ${label}`}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Data & Privacy</h3>
        <div className="mt-4 flex items-center gap-3">
          <button className="px-3 py-1.5 rounded-md bg-surface-high text-sm hover:bg-surface-highest">
            Sign out all sessions
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm text-on-destructive-container hover:bg-destructive-container">
            Delete account
          </button>
        </div>
      </Card>
    </div>
  );
}
