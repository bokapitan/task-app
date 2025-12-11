// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

// Load environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

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
    // --- CHANGE 1: Accept 'useAI' from the request ---
    const { title, description, useAI } = await req.json();

    console.log(`🔄 Creating task: "${title}" | AI Enabled: ${useAI}`);
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("No user found");

    // 1. Create the Main Task (This always happens)
    const { data: taskData, error: taskError } = await supabaseClient
      .from("tasks")
      .insert({
        title,
        description,
        completed: false,
        user_id: user.id,
        label: "personal", // Default label if AI doesn't run
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // --- CHANGE 2: Check if we should run AI ---
    // If useAI is false, we stop here and return the simple task.
    if (useAI === false) {
      console.log("⏩ AI skipped by user request.");
      return new Response(JSON.stringify(taskData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    //  AI LOGIC (Only runs if useAI is true)
    // ============================================================
    
    // 2. Initialize Gemini
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    const prompt = `
      You are a helpful assistant. 
      Task Title: "${title}"
      Task Description: "${description}"
      
      Please generate a JSON object with two fields:
      1. "label": ONE of these exact words: [work, personal, priority, shopping, home].
      2. "subtasks": An array of 3 to 5 short strings, representing actionable steps to complete this task.
      
      Return ONLY the JSON. No markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    const aiData = JSON.parse(cleanJson);
    
    console.log("✨ AI Response:", aiData);

    const suggestedLabel = aiData.label?.toLowerCase() || "personal";
    const subtasks = aiData.subtasks || [];

    // 3. Update the Main Task with the Label
    await supabaseClient
      .from("tasks")
      .update({ label: suggestedLabel })
      .eq("task_id", taskData.task_id);

    // 4. Insert Subtasks
    if (subtasks.length > 0) {
      const subtaskRows = subtasks.map((step: string) => ({
        task_id: taskData.task_id, 
        title: step,
        is_completed: false
      }));

      const { error: subtaskError } = await supabaseClient
        .from("subtasks")
        .insert(subtaskRows);

      if (subtaskError) console.error("Error saving subtasks:", subtaskError);
    }

    // Return the updated task with AI data
    return new Response(JSON.stringify({ ...taskData, label: suggestedLabel, subtasks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in create-task-with-ai:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});