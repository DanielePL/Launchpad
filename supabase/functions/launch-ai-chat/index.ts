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
// ASSISTANT MODE SYSTEM PROMPT
// =============================================================================

const ASSISTANT_MODE_PROMPT = `
## Process-Oriented Assistant Mode

You are now in **Assistant Mode** - a step-by-step guided experience to help users launch their app.

### Core Principles
1. **One Question at a Time**: Never overwhelm the user. Ask ONE focused question, then wait for their answer.
2. **Maximum Automation**: After each answer, use tools to update the session state and generate content automatically.
3. **Visual Progress**: Reference the current phase so users know where they are in the process.
4. **German Language**: Respond in German unless the user writes in another language.

### Phases (in order):
1. **discovery**: Collect app name and short description
2. **code_source**: Ask where the code is (GitHub/Local/None) - offer buttons
3. **tech_analysis**: If GitHub provided, analyze repo; otherwise ask about tech stack
4. **store_presence**: Check if they have Google Play Console / Apple Developer accounts
5. **store_listings**: Generate optimized store descriptions
6. **assets**: Guide icon upload with auto-resize info
7. **compliance**: Generate privacy policy
8. **beta**: Define test strategy
9. **release**: Set timeline and prepare launch

### Rules for Each Response:
1. Start with a brief acknowledgment of their last answer (if applicable)
2. Update session state using the update_assistant_session tool
3. Ask the NEXT single question
4. When possible, offer button-style options (list them clearly)
5. Show current progress: "📍 Phase: [current phase] (Schritt X von Y)"

### Button Format:
When offering choices, format them clearly:
\`\`\`
Wähle eine Option:
• **Option A** - Kurze Beschreibung
• **Option B** - Kurze Beschreibung
• **Option C** - Kurze Beschreibung
\`\`\`

### Progress Indicator Format:
Always include at the end of your response:
\`\`\`
---
📍 **[Phase Name]** | Schritt X
\`\`\`

### Example Flow (Discovery Phase):
User starts session →
"Willkommen! Lass uns deine App launchen. 🚀

Wie heißt deine App?

---
📍 **Basics** | Schritt 1"

User: "FitTracker"
→ Update session with app_name
"Super Name! **FitTracker** klingt gut.

Beschreibe kurz, was deine App macht (1-2 Sätze reichen):

---
📍 **Basics** | Schritt 2"
`;

// =============================================================================
// GITHUB ANALYSIS HELPERS
// =============================================================================

interface RepoAnalysis {
  detected_stack: string;
  framework: string;
  dependencies: string[];
  platforms: string[];
  permissions: string[];
  has_android: boolean;
  has_ios: boolean;
}

async function fetchGitHubFile(owner: string, repo: string, path: string, branch = "main"): Promise<string | null> {
  try {
    const url = \`https://raw.githubusercontent.com/\${owner}/\${repo}/\${branch}/\${path}\`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function analyzeGitHubRepo(repoUrl: string, branch = "main"): Promise<RepoAnalysis> {
  // Parse owner/repo from URL
  const match = repoUrl.match(/github\\.com\\/([^\\/]+)\\/([^\\/]+)/);
  if (!match) {
    return {
      detected_stack: "unknown",
      framework: "unknown",
      dependencies: [],
      platforms: [],
      permissions: [],
      has_android: false,
      has_ios: false,
    };
  }

  const [_, owner, repoName] = match;
  const repo = repoName.replace(/\\.git$/, "");

  // Fetch key files in parallel
  const [packageJson, pubspecYaml, appJson, buildGradle, podfile] = await Promise.all([
    fetchGitHubFile(owner, repo, "package.json", branch),
    fetchGitHubFile(owner, repo, "pubspec.yaml", branch),
    fetchGitHubFile(owner, repo, "app.json", branch),
    fetchGitHubFile(owner, repo, "android/app/build.gradle", branch),
    fetchGitHubFile(owner, repo, "ios/Podfile", branch),
  ]);

  const result: RepoAnalysis = {
    detected_stack: "unknown",
    framework: "unknown",
    dependencies: [],
    platforms: [],
    permissions: [],
    has_android: !!buildGradle,
    has_ios: !!podfile,
  };

  // Detect React Native
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps["react-native"]) {
        result.detected_stack = "react_native";
        result.framework = "React Native";
        result.dependencies = Object.keys(deps).filter(d =>
          d.startsWith("react") || d.startsWith("@react") || d.includes("native")
        );
      } else if (deps["expo"]) {
        result.detected_stack = "expo";
        result.framework = "Expo (React Native)";
        result.dependencies = Object.keys(deps).filter(d =>
          d.startsWith("expo") || d.startsWith("react")
        );
      }
    } catch {
      // Invalid JSON
    }
  }

  // Detect Flutter
  if (pubspecYaml && !result.framework.includes("React")) {
    result.detected_stack = "flutter";
    result.framework = "Flutter";
    // Extract dependencies from pubspec
    const depMatch = pubspecYaml.match(/dependencies:[\\s\\S]*?(?=dev_dependencies:|$)/);
    if (depMatch) {
      const deps = depMatch[0].match(/^\\s{2}\\w+:/gm);
      result.dependencies = deps ? deps.map(d => d.trim().replace(":", "")) : [];
    }
  }

  // Determine platforms
  if (result.has_android) result.platforms.push("android");
  if (result.has_ios) result.platforms.push("ios");

  return result;
}

function generateStoreDescription(
  appName: string,
  appDescription: string,
  features: string[] = [],
  locale = "de"
): { short_description: string; full_description: string; keywords: string[] } {
  // Generate a short description (max 80 chars for Google Play)
  const short_description = appDescription.length <= 80
    ? appDescription
    : appDescription.substring(0, 77) + "...";

  // Generate full description with features
  let full_description = \`**\${appName}**\\n\\n\${appDescription}\\n\\n\`;

  if (features.length > 0) {
    full_description += locale === "de" ? "**Features:**\\n" : "**Features:**\\n";
    features.forEach(f => {
      full_description += \`• \${f}\\n\`;
    });
  }

  // Extract keywords from description
  const words = (appDescription + " " + features.join(" ")).toLowerCase().split(/\\s+/);
  const stopWords = new Set(["und", "oder", "der", "die", "das", "ein", "eine", "für", "mit", "von", "zu", "the", "a", "an", "and", "or", "for", "with"]);
  const keywords = [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w)))].slice(0, 10);

  return { short_description, full_description, keywords };
}

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
    name: "analyze_github_repo",
    description: "Analyze a GitHub repository to detect tech stack, dependencies, and permissions. Use this when the user provides a GitHub URL.",
    input_schema: {
      type: "object" as const,
      properties: {
        repo_url: {
          type: "string",
          description: "The GitHub repository URL (e.g., https://github.com/owner/repo)"
        },
        branch: {
          type: "string",
          description: "The branch to analyze (default: main)"
        }
      },
      required: ["repo_url"]
    }
  },
  {
    name: "generate_store_description",
    description: "Generate optimized app store descriptions (short and full) based on app information",
    input_schema: {
      type: "object" as const,
      properties: {
        app_name: {
          type: "string",
          description: "Name of the app"
        },
        app_description: {
          type: "string",
          description: "Brief description of what the app does"
        },
        features: {
          type: "array",
          items: { type: "string" },
          description: "List of key features"
        },
        locale: {
          type: "string",
          description: "Target locale (default: de for German)"
        }
      },
      required: ["app_name", "app_description"]
    }
  },
  {
    name: "update_assistant_session",
    description: "Update the assistant session state with collected data or move to the next phase. Use this after the user answers questions.",
    input_schema: {
      type: "object" as const,
      properties: {
        session_id: {
          type: "string",
          description: "The session ID"
        },
        phase: {
          type: "string",
          description: "Move to this phase",
          enum: ["discovery", "code_source", "tech_analysis", "store_presence", "store_listings", "assets", "compliance", "beta", "release"]
        },
        step: {
          type: "number",
          description: "Current step within the phase"
        },
        collected_data: {
          type: "object",
          description: "Data to merge into collected_data"
        },
        generated_content: {
          type: "object",
          description: "AI-generated content to store"
        },
        mark_phase_completed: {
          type: "string",
          description: "Mark this phase as completed"
        }
      },
      required: ["session_id"]
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

    case "analyze_github_repo": {
      try {
        const analysis = await analyzeGitHubRepo(
          toolInput.repo_url as string,
          (toolInput.branch as string) || "main"
        );
        return JSON.stringify(analysis);
      } catch (error) {
        return JSON.stringify({
          error: "Failed to analyze repository",
          message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    case "generate_store_description": {
      const result = generateStoreDescription(
        toolInput.app_name as string,
        toolInput.app_description as string,
        (toolInput.features as string[]) || [],
        (toolInput.locale as string) || "de"
      );
      return JSON.stringify(result);
    }

    case "update_assistant_session": {
      const sessionId = toolInput.session_id as string;
      const updates: Record<string, unknown> = {
        last_interaction_at: new Date().toISOString(),
      };

      if (toolInput.phase) {
        updates.current_phase = toolInput.phase;
      }
      if (toolInput.step !== undefined) {
        updates.current_step = toolInput.step;
      }

      // Get current session to merge data
      const { data: currentSession } = await supabase
        .from("assistant_sessions")
        .select("collected_data, generated_content, phases_completed")
        .eq("id", sessionId)
        .single();

      if (toolInput.collected_data) {
        updates.collected_data = {
          ...(currentSession?.collected_data || {}),
          ...(toolInput.collected_data as Record<string, unknown>),
        };
      }

      if (toolInput.generated_content) {
        updates.generated_content = {
          ...(currentSession?.generated_content || {}),
          ...(toolInput.generated_content as Record<string, unknown>),
        };
      }

      if (toolInput.mark_phase_completed) {
        const completed = currentSession?.phases_completed || [];
        if (!completed.includes(toolInput.mark_phase_completed)) {
          updates.phases_completed = [...completed, toolInput.mark_phase_completed];
        }
      }

      const { error } = await supabase
        .from("assistant_sessions")
        .update(updates)
        .eq("id", sessionId);

      if (error) {
        return JSON.stringify({ error: error.message });
      }

      return JSON.stringify({ success: true, updates });
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
    const { conversation_id, message, project_id, session_id, mode } = await req.json();

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

    // Get assistant session context if in assistant mode
    let assistantContext = "";
    let actualSessionId = session_id;
    if (mode === "assistant" && session_id) {
      const { data: session } = await supabaseClient
        .from("assistant_sessions")
        .select("*")
        .eq("id", session_id)
        .single();

      if (session) {
        // Use the session's conversation_id if available
        if (session.conversation_id && !conversation_id) {
          convId = session.conversation_id;
        }

        assistantContext = `\n\n## Assistant Session Context
- Session ID: ${session.id}
- Current Phase: ${session.current_phase}
- Current Step: ${session.current_step}
- Phases Completed: ${session.phases_completed.join(", ") || "none"}
- Collected Data: ${JSON.stringify(session.collected_data)}
- Generated Content: ${JSON.stringify(session.generated_content)}

IMPORTANT: You are in Assistant Mode. Use the session_id "${session.id}" when calling update_assistant_session.`;
      }
    }

    // Build system prompt based on mode
    const systemPrompt = mode === "assistant"
      ? SYSTEM_PROMPT + ASSISTANT_MODE_PROMPT + projectContext + assistantContext
      : SYSTEM_PROMPT + projectContext;

    // Call Claude
    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
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
        system: systemPrompt,
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
