import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env directly
const envPath = path.join(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");

const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*"(.*)"\s*$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars["NEXT_PUBLIC_SUPABASE_URL"] || "https://dxjopdtrtknlbrydzwaw.supabase.co";
const supabaseAnonKey = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "";
const serviceRoleKey = envVars["SUPABASE_SERVICE_ROLE_KEY"] || "";

async function testSupabaseKeys() {
  console.log("==================================================");
  console.log("🔑 TESTING SUPABASE API KEYS & REST ENDPOINTS");
  console.log("==================================================");
  console.log(`URL: ${supabaseUrl}`);

  // 1. Test Anon Key
  try {
    const clientAnon = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await clientAnon.from("profiles").select("*").limit(5);
    if (error) {
      console.log(`🔹 Anon Key Response: ${error.message}`);
    } else {
      console.log(`✅ Anon Key Connection SUCCESS! Data returned:`, data);
    }
  } catch (err: any) {
    console.log(`❌ Anon Key Error: ${err.message}`);
  }

  // 2. Test Service Role Key
  try {
    const clientAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await clientAdmin.from("profiles").select("*").limit(5);
    if (error) {
      console.log(`🔸 Service Role Response: ${error.message}`);
    } else {
      console.log(`✅ Service Role Key Connection SUCCESS! Data returned:`, data);
    }
  } catch (err: any) {
    console.log(`❌ Service Role Key Error: ${err.message}`);
  }

  console.log("==================================================");
}

testSupabaseKeys();
