const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://lfiooxqgdphkqrowrptd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaW9veHFnZHBoa3Fyb3dycHRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMwOTEyNSwiZXhwIjoyMDkyODg1MTI1fQ.A6r5nDmT6e-JPrTI3nklyeqv74H3QUoi7Wo38sYFEZI";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function create() {
  const randomSuffix = Math.floor(Math.random() * 10000);
  const email = `testuser${randomSuffix}@tradebot.in`;
  console.log(`Creating user ${email}...`);
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: "password123",
    email_confirm: true,
    user_metadata: {
      full_name: "Test User",
      company_name: "TradeBot Admin",
      role: "Exporter",
    },
  });
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success! You can now log in with:");
    console.log(`Email: ${email}`);
    console.log("Password: password123");
  }
}
create();
