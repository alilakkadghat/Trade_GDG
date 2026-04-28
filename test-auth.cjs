const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://lfiooxqgdphkqrowrptd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaW9veHFnZHBoa3Fyb3dycHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMDkxMjUsImV4cCI6MjA5Mjg4NTEyNX0.3BVEyuDiMM2PrFrYxZFVZbeROBJtvy4ZIEaZs8o64Sg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log("Testing signUp...");
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: "test" + Date.now() + "@example.com",
    password: "Password123!",
    options: {
      data: {
        full_name: "Test User",
        company_name: "Test Corp",
        role: "Exporter",
      },
    },
  });

  if (signUpError) {
    console.log("SignUp Error:", signUpError.message);
  } else {
    console.log("SignUp Success!");
    console.log("Session exists after signUp?:", !!signUpData.session);
  }

  console.log("\nTesting signIn...");
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: "rohan@kanchan-exports.in", // Using the default email from login form
    password: "Password123!", // Using a dummy password since I don't know the real one, but the error message will be revealing
  });

  if (signInError) {
    console.log("SignIn Error:", signInError.message);
  } else {
    console.log("SignIn Success!");
  }
}

testAuth();
