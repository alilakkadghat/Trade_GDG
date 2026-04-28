const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://lfiooxqgdphkqrowrptd.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaW9veHFnZHBoa3Fyb3dycHRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMwOTEyNSwiZXhwIjoyMDkyODg1MTI1fQ.A6r5nDmT6e-JPrTI3nklyeqv74H3QUoi7Wo38sYFEZI";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupTestUser() {
  console.log("Setting up a test user to bypass rate limits...");
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@tradebot.in",
    password: "password123",
    email_confirm: true,
    user_metadata: {
      full_name: "Admin User",
      company_name: "TradeBot Admin",
      role: "Exporter",
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      console.log("User admin@tradebot.in already exists. Resetting password...");
      await supabaseAdmin.auth.admin.updateUserById(
        (await supabaseAdmin.auth.admin.listUsers()).data.users.find(
          (u) => u.email === "admin@tradebot.in",
        ).id,
        { password: "password123" },
      );
      console.log("Password reset successfully.");
    } else {
      console.log("Failed:", error.message);
    }
  } else {
    console.log("Created user successfully:", data.user.email);
  }
}

setupTestUser();
