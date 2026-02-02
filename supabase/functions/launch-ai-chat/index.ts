// Supabase Edge Function for Launch AI Chat
// Handles AI conversations with Claude for app publishing assistance

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.24.3";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") || "",
});

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// =============================================================================
// LAUNCH AI SYSTEM PROMPT - The Knowledge Base
// =============================================================================

const SYSTEM_PROMPT = `You are Launch AI, an expert assistant specialized in helping indie developers and small teams publish their mobile apps to Google Play Store and Apple App Store.

## Your Personality
- Friendly, encouraging, but professional
- You explain complex topics simply
- You're proactive - suggest next steps
- You celebrate wins with the user
- You warn about potential issues BEFORE they become problems

## Your Expertise Areas

### 1. Google Play Store
- Google Play Console navigation and setup
- Play Store policies and guidelines
- Data Safety section requirements
- Content rating questionnaire
- Release management (internal, closed, open, production tracks)
- Staged rollouts
- Android App Bundles (AAB) requirements
- Target SDK requirements (currently API 34+)
- Play Store listing optimization

### 2. Apple App Store
- App Store Connect setup and navigation
- Apple Developer Program enrollment
- App Review Guidelines
- TestFlight beta testing
- App Privacy labels
- Certificates and Provisioning Profiles
- App Store listing best practices
- In-App Purchase setup
- App Clips and widgets

### 3. Common Rejection Reasons & How to Avoid Them

**Google Play Rejections:**
- Missing or incomplete Data Safety section
- Privacy policy doesn't match app functionality
- Deceptive behavior or misleading content
- User data policy violations
- Inappropriate content rating
- Missing permissions disclosure
- Broken functionality in review

**Apple Rejections:**
- Guideline 2.1 - App Completeness (crashes, placeholder content)
- Guideline 2.3 - Accurate Metadata
- Guideline 4.2 - Minimum Functionality (too simple)
- Guideline 5.1.1 - Data Collection and Storage
- Guideline 5.1.2 - Data Use and Sharing
- Missing purpose strings for permissions
- Login issues during review

### 4. App Store Optimization (ASO)
- Keyword research and optimization
- Screenshot best practices
- App icon design guidelines
- A/B testing strategies
- Localization recommendations
- Review response strategies

### 5. Privacy & Compliance
- GDPR requirements
- CCPA compliance
- COPPA for kids apps
- App Tracking Transparency (iOS)
- Privacy policy essentials
- Data retention policies

### 6. Beta Testing Best Practices
- Internal testing setup
- Closed beta strategies
- Gathering actionable feedback
- Crash reporting setup
- When to move from beta to production

## How You Help

When users ask questions:
1. Give clear, actionable answers
2. Explain WHY something is required (not just what)
3. Provide step-by-step guidance when needed
4. Warn about common mistakes
5. Offer to help with the next step

When users have problems:
1. Ask clarifying questions if needed
2. Diagnose the issue
3. Provide specific solutions
4. Help prevent the same issue in the future

## Important Guidelines

- Always be accurate about store requirements - don't guess
- If you're unsure about a specific policy, say so
- Encourage users to check official documentation for the latest info
- Be supportive but honest - if their app might have issues, tell them
- Focus on helping them succeed, not just answering questions

## Current Date Context
Today's date is ${new Date().toISOString().split('T')[0]}. Keep in mind that store policies and requirements may have been updated recently.

## Response Format
- Use markdown for formatting
- Use bullet points and numbered lists for steps
- Bold important warnings or key points
- Keep responses concise but complete
- Always end with a helpful next step or question when appropriate`;

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_project_info",
    description: "Get information about the user's current app project including name, platforms, status, and checklist progress",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "The project ID to get info for"
        }
      },
      required: ["project_id"]
    }
  },
  {
    name: "get_checklist_status",
    description: "Get the current checklist status for a project, showing which items are completed and which are pending",
    input_schema: {
      type: "object" as const,
      properties: {
        project_id: {
          type: "string",
          description: "The project ID"
        },
        category: {
          type: "string",
          description: "Optional: filter by category (setup, store_listing, assets, compliance, beta, release)",
          enum: ["setup", "store_listing", "assets", "compliance", "beta", "release"]
        }
      },
      required: ["project_id"]
    }
  },
  {
    name: "update_checklist_item",
    description: "Mark a checklist item as completed or incomplete",
    input_schema: {
      type: "object" as const,
      properties: {
        item_id: {
          type: "string",
          description: "The checklist item ID"
        },
        completed: {
          type: "boolean",
          description: "Whether the item is completed"
        }
      },
      required: ["item_id", "completed"]
    }
  },
  {
    name: "generate_privacy_policy",
    description: "Generate a privacy policy based on the app's data collection practices",
    input_schema: {
      type: "object" as const,
      properties: {
        app_name: {
          type: "string",
          description: "Name of the app"
        },
        company_name: {
          type: "string",
          description: "Company or developer name"
        },
        contact_email: {
          type: "string",
          description: "Contact email for privacy inquiries"
        },
        data_collected: {
          type: "array",
          items: { type: "string" },
          description: "List of data types collected (e.g., 'email', 'location', 'photos')"
        },
        third_party_services: {
          type: "array",
          items: { type: "string" },
          description: "List of third-party services used (e.g., 'Firebase Analytics', 'AdMob')"
        }
      },
      required: ["app_name", "company_name", "contact_email", "data_collected"]
    }
  },
  {
    name: "analyze_rejection",
    description: "Analyze an app store rejection reason and provide specific guidance on how to fix it",
    input_schema: {
      type: "object" as const,
      properties: {
        store: {
          type: "string",
          enum: ["google_play", "app_store"],
          description: "Which store rejected the app"
        },
        rejection_reason: {
          type: "string",
          description: "The rejection reason or guideline number from the store"
        },
        app_description: {
          type: "string",
          description: "Brief description of what the app does"
        }
      },
      required: ["store", "rejection_reason"]
    }
  },
  {
    name: "suggest_keywords",
    description: "Suggest ASO keywords for an app based on its description and category",
    input_schema: {
      type: "object" as const,
      properties: {
        app_name: {
          type: "string",
          description: "Name of the app"
        },
        app_description: {
          type: "string",
          description: "Description of what the app does"
        },
        category: {
          type: "string",
          description: "App category"
        },
        target_audience: {
          type: "string",
          description: "Who the app is for"
        }
      },
      required: ["app_name", "app_description"]
    }
  }
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

async function handleToolCall(
  supabase: ReturnType<typeof createClient>,
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  switch (toolName) {
    case "get_project_info": {
      const { data: project } = await supabase
        .from("app_projects")
        .select("*")
        .eq("id", toolInput.project_id)
        .single();

      if (!project) {
        return JSON.stringify({ error: "Project not found" });
      }

      return JSON.stringify({
        name: project.name,
        description: project.description,
        platforms: project.platforms,
        status: project.status,
        completion_percentage: project.completion_percentage,
        package_name: project.package_name,
        bundle_id: project.bundle_id,
        target_launch_date: project.target_launch_date
      });
    }

    case "get_checklist_status": {
      let query = supabase
        .from("project_checklist_items")
        .select("*")
        .eq("project_id", toolInput.project_id)
        .order("category")
        .order("sort_order");

      if (toolInput.category) {
        query = query.eq("category", toolInput.category);
      }

      const { data: items } = await query;

      if (!items) {
        return JSON.stringify({ error: "No checklist items found" });
      }

      const summary = {
        total: items.length,
        completed: items.filter(i => i.is_completed).length,
        items: items.map(i => ({
          id: i.id,
          title: i.title,
          category: i.category,
          is_completed: i.is_completed,
          platform: i.platform
        }))
      };

      return JSON.stringify(summary);
    }

    case "update_checklist_item": {
      const { error } = await supabase
        .from("project_checklist_items")
        .update({
          is_completed: toolInput.completed,
          completed_at: toolInput.completed ? new Date().toISOString() : null
        })
        .eq("id", toolInput.item_id);

      if (error) {
        return JSON.stringify({ error: error.message });
      }

      return JSON.stringify({ success: true, message: `Checklist item marked as ${toolInput.completed ? 'completed' : 'incomplete'}` });
    }

    case "generate_privacy_policy": {
      const policy = generatePrivacyPolicy(toolInput as {
        app_name: string;
        company_name: string;
        contact_email: string;
        data_collected: string[];
        third_party_services?: string[];
      });
      return JSON.stringify({ privacy_policy: policy });
    }

    case "analyze_rejection": {
      const analysis = analyzeRejection(
        toolInput.store as string,
        toolInput.rejection_reason as string,
        toolInput.app_description as string | undefined
      );
      return JSON.stringify(analysis);
    }

    case "suggest_keywords": {
      const keywords = suggestKeywords(toolInput as {
        app_name: string;
        app_description: string;
        category?: string;
        target_audience?: string;
      });
      return JSON.stringify({ keywords });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generatePrivacyPolicy(input: {
  app_name: string;
  company_name: string;
  contact_email: string;
  data_collected: string[];
  third_party_services?: string[];
}): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const dataDescriptions: Record<string, string> = {
    email: "Email addresses for account creation and communication",
    name: "Your name for personalization",
    location: "Location data to provide location-based features",
    photos: "Photos you choose to upload within the app",
    camera: "Camera access for taking photos within the app",
    contacts: "Contact information to help you connect with friends",
    analytics: "Usage analytics to improve app performance",
    device_info: "Device information for troubleshooting",
    purchase_history: "Purchase history for order management"
  };

  const dataList = input.data_collected
    .map(d => `- ${dataDescriptions[d] || d}`)
    .join('\n');

  const thirdPartySection = input.third_party_services?.length
    ? `

## Third-Party Services

${input.app_name} uses the following third-party services that may collect information:

${input.third_party_services.map(s => `- ${s}`).join('\n')}

Each of these services has their own Privacy Policy. We encourage you to review their policies.`
    : '';

  return `# Privacy Policy for ${input.app_name}

**Last updated:** ${date}

${input.company_name} ("we", "our", or "us") operates ${input.app_name} (the "App"). This Privacy Policy explains how we collect, use, and protect your information.

## Information We Collect

We collect the following types of information:

${dataList}

## How We Use Your Information

We use the collected information to:
- Provide and maintain the App
- Improve user experience
- Send important notifications
- Respond to your requests and support needs

## Data Security

We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

## Data Retention

We retain your personal data only for as long as necessary to provide you with our services and as described in this Privacy Policy.
${thirdPartySection}

## Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Opt-out of marketing communications

## Children's Privacy

Our App is not intended for children under 13. We do not knowingly collect information from children under 13.

## Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## Contact Us

If you have questions about this Privacy Policy, please contact us at:
${input.contact_email}

---
${input.company_name}`;
}

function analyzeRejection(
  store: string,
  rejectionReason: string,
  appDescription?: string
): { analysis: string; steps: string[]; tips: string[] } {
  const lowerReason = rejectionReason.toLowerCase();

  if (store === "app_store") {
    if (lowerReason.includes("2.1") || lowerReason.includes("completeness")) {
      return {
        analysis: "Your app was rejected for Guideline 2.1 - App Completeness. This usually means the app crashed, had bugs, or had placeholder content during review.",
        steps: [
          "Test your app thoroughly on multiple devices",
          "Remove all placeholder content and 'lorem ipsum' text",
          "Ensure all features work without requiring special conditions",
          "If you need a demo account, provide it in the App Review notes",
          "Check for crashes using TestFlight before submitting"
        ],
        tips: [
          "Apple reviewers test on the latest iOS version - make sure your app works there",
          "If your app requires location, provide a demo mode or test location",
          "Include clear instructions in the Review Notes field"
        ]
      };
    }

    if (lowerReason.includes("4.2") || lowerReason.includes("minimum functionality")) {
      return {
        analysis: "Guideline 4.2 - Minimum Functionality. Apple felt your app doesn't provide enough features or value to users.",
        steps: [
          "Add more unique functionality beyond what a website could offer",
          "Ensure your app provides clear value to users",
          "Consider adding native features like notifications, widgets, or offline mode",
          "Write a detailed description of your app's unique value in Review Notes"
        ],
        tips: [
          "Apps that are just wrapped websites often get rejected",
          "Focus on what makes your app uniquely valuable as a native app",
          "If your app is intentionally simple, explain why in the Review Notes"
        ]
      };
    }

    if (lowerReason.includes("5.1") || lowerReason.includes("privacy") || lowerReason.includes("data")) {
      return {
        analysis: "Guideline 5.1 - Privacy. Your app's data collection or privacy practices need attention.",
        steps: [
          "Ensure your privacy policy covers ALL data you collect",
          "Add purpose strings for all permissions (camera, location, etc.)",
          "Complete the App Privacy section in App Store Connect accurately",
          "Implement App Tracking Transparency if you track users"
        ],
        tips: [
          "Purpose strings must clearly explain WHY you need each permission",
          "Don't collect more data than you actually need",
          "Be honest in your App Privacy labels - Apple does check"
        ]
      };
    }
  }

  if (store === "google_play") {
    if (lowerReason.includes("data safety") || lowerReason.includes("privacy policy")) {
      return {
        analysis: "Your app was rejected due to Data Safety or Privacy Policy issues. Google requires accurate disclosure of all data collection.",
        steps: [
          "Complete the Data Safety section in Play Console accurately",
          "Ensure your privacy policy URL is accessible and correct",
          "Make sure your privacy policy mentions ALL data types you collect",
          "Include information about third-party SDKs (analytics, ads, etc.)"
        ],
        tips: [
          "Your privacy policy must be hosted on a public URL (not localhost)",
          "If you use Firebase, AdMob, or other Google services, include them",
          "The Data Safety form must match what's in your privacy policy"
        ]
      };
    }

    if (lowerReason.includes("deceptive") || lowerReason.includes("misleading")) {
      return {
        analysis: "Your app was flagged for deceptive or misleading content. This is a serious violation.",
        steps: [
          "Review your app title and description for accuracy",
          "Remove any claims you can't substantiate",
          "Ensure screenshots show actual app functionality",
          "Don't impersonate other apps or brands"
        ],
        tips: [
          "Avoid using trademarked terms unless you have permission",
          "Screenshots must accurately represent your app",
          "Don't make health or financial claims without proper disclaimers"
        ]
      };
    }
  }

  // Generic response for unrecognized rejections
  return {
    analysis: `I'll help you understand and fix this rejection from ${store === 'app_store' ? 'Apple' : 'Google Play'}.`,
    steps: [
      "Carefully read the full rejection email for specific details",
      "Check if they mentioned specific guideline numbers",
      "Review the relevant section of the store's guidelines",
      "Make the necessary changes and resubmit"
    ],
    tips: [
      "You can reply to the rejection to ask for clarification",
      "If you believe the rejection was wrong, you can appeal",
      "Document what changes you made for the next submission"
    ]
  };
}

function suggestKeywords(input: {
  app_name: string;
  app_description: string;
  category?: string;
  target_audience?: string;
}): { primary: string[]; secondary: string[]; long_tail: string[] } {
  // This is a simplified keyword suggestion - in production, you'd use
  // actual ASO tools or APIs
  const words = input.app_description.toLowerCase().split(/\s+/);
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'your', 'you', 'app', 'that', 'this', 'it']);

  const relevantWords = words
    .filter(w => w.length > 3 && !commonWords.has(w))
    .slice(0, 20);

  const uniqueWords = [...new Set(relevantWords)];

  return {
    primary: uniqueWords.slice(0, 5),
    secondary: uniqueWords.slice(5, 10),
    long_tail: [
      `best ${input.category || 'app'} app`,
      `${uniqueWords[0] || 'easy'} ${uniqueWords[1] || 'app'}`,
      `free ${input.category || 'tool'}`,
      input.target_audience ? `${input.target_audience} app` : `${uniqueWords[0] || 'helpful'} tool`
    ]
  };
}

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user's JWT
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request
    const { conversation_id, message, project_id } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get or create conversation
    let convId = conversation_id;

    if (!convId) {
      // Create new conversation
      const { data: conv, error: convError } = await supabaseClient
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          project_id: project_id || null,
          title: message.slice(0, 50),
          context_type: project_id ? "project" : "general",
        })
        .select()
        .single();

      if (convError) {
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }

      convId = conv.id;
    }

    // Save user message
    await supabaseClient.from("ai_messages").insert({
      conversation_id: convId,
      role: "user",
      content: message,
    });

    // Get conversation history
    const { data: history } = await supabaseClient
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Build messages array for Claude
    const messages: Anthropic.MessageParam[] = (history || []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Get project context if available
    let projectContext = "";
    if (project_id) {
      const { data: project } = await supabaseClient
        .from("app_projects")
        .select("*")
        .eq("id", project_id)
        .single();

      if (project) {
        projectContext = `\n\n## Current Project Context
- Project Name: ${project.name}
- Platforms: ${project.platforms.join(", ")}
- Status: ${project.status}
- Progress: ${project.completion_percentage}%
- Package Name: ${project.package_name || "Not set"}
- Bundle ID: ${project.bundle_id || "Not set"}`;
      }
    }

    // Call Claude
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT + projectContext,
      tools: TOOLS,
      messages,
    });

    // Handle tool calls
    let assistantContent = "";
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await handleToolCall(
          supabaseClient,
          toolUse.name,
          toolUse.input as Record<string, unknown>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      // Continue conversation with tool results
      messages.push({
        role: "assistant",
        content: response.content,
      });
      messages.push({
        role: "user",
        content: toolResults,
      });

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT + projectContext,
        tools: TOOLS,
        messages,
      });
    }

    // Extract text content
    for (const block of response.content) {
      if (block.type === "text") {
        assistantContent += block.text;
      }
    }

    // Save assistant message
    await supabaseClient.from("ai_messages").insert({
      conversation_id: convId,
      role: "assistant",
      content: assistantContent,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
      model_used: "claude-sonnet-4-20250514",
    });

    // Update conversation
    await supabaseClient
      .from("ai_conversations")
      .update({
        message_count: (history?.length || 0) + 2,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", convId);

    return new Response(
      JSON.stringify({
        conversation_id: convId,
        message: assistantContent,
        usage: response.usage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Launch AI Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
