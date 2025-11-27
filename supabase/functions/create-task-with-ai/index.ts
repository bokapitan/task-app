// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai"; // CHANGED: Using Google

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY"); // CHANGED: Using Gemini Key

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    console.log("🔄 Creating task with AI suggestions...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user session
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    // Create the task
    const { data, error } = await supabaseClient
      .from("tasks")
      .insert({
        title,
        description,
        completed: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // --- CHANGED SECTION STARTS HERE ---
    // Initialize Gemini
    if (!GEMINI_API_KEY) {
      console.error("Missing GEMINI_API_KEY");
      throw new Error("Server configuration error: Missing AI Key");
    }
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Get label suggestion from Gemini
    const prompt = `Based on this task title: "${title}" and description: "${description}", suggest ONE of these labels: work, personal, priority, shopping, home. Reply with just the label word and nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Extract text safely
    const suggestedLabel = response.text()
      .toLowerCase()
      .trim();
    // --- CHANGED SECTION ENDS HERE ---

    console.log(`✨ AI Suggested Label: ${suggestedLabel}`);

    // Validate the label
    const validLabels = ["work", "personal", "priority", "shopping", "home"];
    const label = validLabels.includes(suggestedLabel) ? suggestedLabel : null;

    // Update the task with the suggested label
    const { data: updatedTask, error: updateError } = await supabaseClient
      .from("tasks")
      .update({ label })
      .eq("task_id", data.task_id) // make sure to use data.task_id from the creation step
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(JSON.stringify(updatedTask), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in create-task-with-ai:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});