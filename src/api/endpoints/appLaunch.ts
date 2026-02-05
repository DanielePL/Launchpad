import { supabase } from "@/api/supabaseClient";

// =============================================================================
// DEV MODE - Skip database calls for assistant sessions
// =============================================================================
const DEV_SKIP_AUTH = true;

const MOCK_SESSION_ID = "00000000-0000-0000-0000-000000000099";
const MOCK_CONV_ID = "00000000-0000-0000-0000-000000000098";

import type {
  AppProject,
  CreateAppProjectInput,
  UpdateAppProjectInput,
  ChecklistItem,
  AIConversation,
  AIMessage,
  CreateConversationInput,
  AppLaunchStats,
  BetaTester,
  InviteTesterInput,
  AppRelease,
  CreateReleaseInput,
  ProjectAsset,
  UploadAssetInput,
  UpdateAssetInput,
  AssetFilters,
  AssetRequirementsStatus,
  RequirementStatus,
  AssistantSession,
} from "@/api/types/appLaunch";
import { SCREENSHOT_REQUIREMENTS } from "@/api/types/appLaunch";

// =============================================================================
// App Projects
// =============================================================================

/**
 * Get all app projects for the organization
 */
export async function getAppProjects(): Promise<AppProject[]> {
  // DEV MODE: Return projects from localStorage
  if (DEV_SKIP_AUTH) {
    const localProjects = JSON.parse(localStorage.getItem("launchpad_projects") || "[]");
    return localProjects as AppProject[];
  }

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("app_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching app projects:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single app project by ID
 */
export async function getAppProject(projectId: string): Promise<AppProject | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("app_projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    console.error("Error fetching app project:", error);
    return null;
  }

  return data;
}

/**
 * Create a new app project
 */
export async function createAppProject(
  input: CreateAppProjectInput
): Promise<AppProject | null> {
  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("app_projects")
    .insert({
      ...input,
      created_by: userData.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating app project:", error);
    throw new Error(error.message);
  }

  // Create default checklist items
  if (data) {
    await supabase.rpc("create_project_checklist", {
      p_project_id: data.id,
      p_platforms: input.platforms,
    });
  }

  return data;
}

/**
 * Update an app project
 */
export async function updateAppProject(
  projectId: string,
  input: UpdateAppProjectInput
): Promise<AppProject | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("app_projects")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    console.error("Error updating app project:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete an app project
 */
export async function deleteAppProject(projectId: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from("app_projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting app project:", error);
    throw new Error(error.message);
  }

  return true;
}

// =============================================================================
// Checklist Items
// =============================================================================

/**
 * Get checklist items for a project
 */
export async function getProjectChecklist(projectId: string): Promise<ChecklistItem[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("project_checklist_items")
    .select("*")
    .eq("project_id", projectId)
    .order("category")
    .order("sort_order");

  if (error) {
    console.error("Error fetching checklist:", error);
    return [];
  }

  return data || [];
}

/**
 * Toggle checklist item completion
 */
export async function toggleChecklistItem(
  itemId: string,
  completed: boolean
): Promise<ChecklistItem | null> {
  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("project_checklist_items")
    .update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? userData.user?.id : null,
    })
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("Error toggling checklist item:", error);
    throw new Error(error.message);
  }

  return data;
}

// =============================================================================
// AI Conversations
// =============================================================================

/**
 * Get all conversations for the current user
 */
export async function getConversations(projectId?: string): Promise<AIConversation[]> {
  // DEV MODE: Return empty array
  if (DEV_SKIP_AUTH) return [];

  if (!supabase) return [];

  let query = supabase
    .from("ai_conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return data || [];
}

/**
 * Get a single conversation with messages
 */
export async function getConversation(conversationId: string): Promise<{
  conversation: AIConversation;
  messages: AIMessage[];
} | null> {
  // DEV MODE: Return null
  if (DEV_SKIP_AUTH) return null;

  if (!supabase) return null;

  const [conversationResult, messagesResult] = await Promise.all([
    supabase
      .from("ai_conversations")
      .select("*")
      .eq("id", conversationId)
      .single(),
    supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);

  if (conversationResult.error) {
    console.error("Error fetching conversation:", conversationResult.error);
    return null;
  }

  return {
    conversation: conversationResult.data,
    messages: messagesResult.data || [],
  };
}

/**
 * Create a new conversation
 */
export async function createConversation(
  input: CreateConversationInput
): Promise<AIConversation | null> {
  // DEV MODE: Return mock conversation
  if (DEV_SKIP_AUTH) {
    console.log("🔓 DEV MODE: Creating mock conversation");
    return {
      id: MOCK_CONV_ID,
      user_id: "00000000-0000-0000-0000-000000000001",
      project_id: input.project_id || null,
      title: input.title || "DEV Conversation",
      context_type: input.context_type || "general",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as AIConversation;
  }

  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({
      ...input,
      user_id: userData.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string,
  extras?: {
    attachments?: AIMessage["attachments"];
    suggested_actions?: AIMessage["suggested_actions"];
    tokens_used?: number;
    model_used?: string;
  }
): Promise<AIMessage | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
      attachments: extras?.attachments || [],
      suggested_actions: extras?.suggested_actions || [],
      tokens_used: extras?.tokens_used,
      model_used: extras?.model_used,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding message:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  if (!supabase) return;

  await supabase
    .from("ai_conversations")
    .update({ title })
    .eq("id", conversationId);
}

// =============================================================================
// Beta Testers
// =============================================================================

/**
 * Get beta testers for a project
 */
export async function getBetaTesters(projectId: string): Promise<BetaTester[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("app_beta_testers")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching beta testers:", error);
    return [];
  }

  return data || [];
}

/**
 * Invite beta testers
 */
export async function inviteBetaTesters(
  testers: InviteTesterInput[]
): Promise<BetaTester[]> {
  if (!supabase) return [];

  const testersWithTokens = testers.map((t) => ({
    ...t,
    invite_token: crypto.randomUUID(),
    invite_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { data, error } = await supabase
    .from("app_beta_testers")
    .insert(testersWithTokens)
    .select();

  if (error) {
    console.error("Error inviting beta testers:", error);
    throw new Error(error.message);
  }

  return data || [];
}

// =============================================================================
// Releases
// =============================================================================

/**
 * Get releases for a project
 */
export async function getReleases(projectId: string): Promise<AppRelease[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("app_releases")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching releases:", error);
    return [];
  }

  return data || [];
}

/**
 * Create a new release
 */
export async function createRelease(
  input: CreateReleaseInput
): Promise<AppRelease | null> {
  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("app_releases")
    .insert({
      ...input,
      created_by: userData.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating release:", error);
    throw new Error(error.message);
  }

  return data;
}

// =============================================================================
// Dashboard Stats
// =============================================================================

/**
 * Get app launch dashboard stats
 */
export async function getAppLaunchStats(): Promise<AppLaunchStats> {
  // DEV MODE: Return stats from localStorage projects
  if (DEV_SKIP_AUTH) {
    const localProjects = JSON.parse(localStorage.getItem("launchpad_projects") || "[]");
    const statusCounts: Record<string, number> = {};
    localProjects.forEach((p: { status: string }) => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    return {
      total_projects: localProjects.length,
      projects_by_status: statusCounts,
      active_beta_testers: 0,
      pending_reviews: 0,
      live_apps: statusCounts.live || 0,
    };
  }

  if (!supabase) {
    return {
      total_projects: 0,
      projects_by_status: {} as Record<string, number>,
      active_beta_testers: 0,
      pending_reviews: 0,
      live_apps: 0,
    };
  }

  const [projectsResult, testersResult, releasesResult] = await Promise.all([
    supabase.from("app_projects").select("status"),
    supabase
      .from("app_beta_testers")
      .select("id")
      .eq("status", "active"),
    supabase
      .from("app_releases")
      .select("id")
      .in("status", ["pending_review", "in_review"]),
  ]);

  const projects = projectsResult.data || [];
  const statusCounts: Record<string, number> = {};

  projects.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  return {
    total_projects: projects.length,
    projects_by_status: statusCounts,
    active_beta_testers: testersResult.data?.length || 0,
    pending_reviews: releasesResult.data?.length || 0,
    live_apps: statusCounts.live || 0,
  };
}

// =============================================================================
// Project Assets
// =============================================================================

const ASSETS_BUCKET = "app-assets";

/**
 * Get all assets for a project with optional filters
 */
export async function getProjectAssets(
  projectId: string,
  filters?: AssetFilters
): Promise<ProjectAsset[]> {
  if (!supabase) return [];

  let query = supabase
    .from("project_assets")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.asset_type) {
    query = query.eq("asset_type", filters.asset_type);
  }
  if (filters?.platform) {
    query = query.eq("platform", filters.platform);
  }
  if (filters?.device_type) {
    query = query.eq("device_type", filters.device_type);
  }
  if (filters?.locale) {
    query = query.eq("locale", filters.locale);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching project assets:", error);
    return [];
  }

  return data || [];
}

/**
 * Upload an asset to storage and create DB record
 */
export async function uploadAsset(input: UploadAssetInput): Promise<ProjectAsset | null> {
  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();
  const { data: project } = await supabase
    .from("app_projects")
    .select("organization_id")
    .eq("id", input.project_id)
    .single();

  if (!project) {
    throw new Error("Project not found");
  }

  // Build storage path: {org_id}/{project_id}/{asset_type}/{uuid}_{filename}
  const uuid = crypto.randomUUID();
  const sanitizedName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const folder = input.asset_type === "screenshot" ? `screenshots/${input.device_type || "phone"}` :
                 input.asset_type === "icon" ? "icons" :
                 input.asset_type === "feature_graphic" ? "feature-graphics" :
                 input.asset_type;
  const storagePath = `${project.organization_id}/${input.project_id}/${folder}/${uuid}_${sanitizedName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(storagePath, input.file, {
      contentType: input.file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading asset:", uploadError);
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(ASSETS_BUCKET)
    .getPublicUrl(storagePath);

  // Get image dimensions if it's an image
  let width: number | null = null;
  let height: number | null = null;

  if (input.file.type.startsWith("image/")) {
    try {
      const dimensions = await getImageDimensions(input.file);
      width = dimensions.width;
      height = dimensions.height;
    } catch {
      // Ignore dimension errors
    }
  }

  // Get current max sort_order for this asset type
  const { data: maxSortData } = await supabase
    .from("project_assets")
    .select("sort_order")
    .eq("project_id", input.project_id)
    .eq("asset_type", input.asset_type)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxSortData?.sort_order ?? -1) + 1;

  // Create DB record
  const { data, error } = await supabase
    .from("project_assets")
    .insert({
      project_id: input.project_id,
      organization_id: project.organization_id,
      asset_type: input.asset_type,
      name: input.name,
      platform: input.platform,
      device_type: input.device_type || null,
      file_path: storagePath,
      file_url: urlData.publicUrl,
      file_size: input.file.size,
      mime_type: input.file.type,
      width,
      height,
      sort_order: sortOrder,
      metadata: input.metadata || {},
      uploaded_by: userData.user?.id,
    })
    .select()
    .single();

  if (error) {
    // Clean up uploaded file if DB insert fails
    await supabase.storage.from(ASSETS_BUCKET).remove([storagePath]);
    console.error("Error creating asset record:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Helper to get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Update asset metadata
 */
export async function updateAsset(
  assetId: string,
  input: UpdateAssetInput
): Promise<ProjectAsset | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("project_assets")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", assetId)
    .select()
    .single();

  if (error) {
    console.error("Error updating asset:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete an asset from storage and DB
 */
export async function deleteAsset(assetId: string): Promise<boolean> {
  if (!supabase) return false;

  // Get the asset to find storage path
  const { data: asset } = await supabase
    .from("project_assets")
    .select("file_path")
    .eq("id", assetId)
    .single();

  if (asset?.file_path) {
    await supabase.storage.from(ASSETS_BUCKET).remove([asset.file_path]);
  }

  const { error } = await supabase
    .from("project_assets")
    .delete()
    .eq("id", assetId);

  if (error) {
    console.error("Error deleting asset:", error);
    throw new Error(error.message);
  }

  return true;
}

/**
 * Reorder assets within a project/type
 */
export async function reorderAssets(
  projectId: string,
  orderedIds: string[]
): Promise<boolean> {
  if (!supabase) return false;

  // Update each asset with its new sort_order
  const updates = orderedIds.map((id, index) =>
    supabase!
      .from("project_assets")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("project_id", projectId)
  );

  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);

  if (hasError) {
    console.error("Error reordering assets");
    return false;
  }

  return true;
}

/**
 * Get the status of asset requirements for a project
 */
export async function getAssetRequirementsStatus(
  projectId: string
): Promise<AssetRequirementsStatus | null> {
  if (!supabase) return null;

  // Get project platforms
  const { data: project } = await supabase
    .from("app_projects")
    .select("platforms")
    .eq("id", projectId)
    .single();

  if (!project) return null;

  // Get all assets for this project
  const { data: assets } = await supabase
    .from("project_assets")
    .select("*")
    .eq("project_id", projectId);

  const assetList = assets || [];

  // Build screenshot requirements status
  const screenshotStatus: AssetRequirementsStatus["screenshots"] = {
    android: [],
    ios: [],
  };

  for (const req of SCREENSHOT_REQUIREMENTS) {
    if (!project.platforms.includes(req.platform)) continue;

    const matchingAssets = assetList.filter(
      (a) =>
        a.asset_type === "screenshot" &&
        (a.platform === req.platform || a.platform === "both") &&
        a.device_type === req.device_type
    );

    const status: RequirementStatus = {
      device_type: req.device_type,
      device_name: req.device_name,
      required: req.required,
      min_count: req.required ? 2 : 0,
      max_count: req.max_count,
      uploaded_count: matchingAssets.length,
      is_satisfied: req.required ? matchingAssets.length >= 2 : true,
    };

    screenshotStatus[req.platform].push(status);
  }

  // Check icon status
  const iconStatus = {
    android: project.platforms.includes("android")
      ? assetList.some((a) => a.asset_type === "icon" && (a.platform === "android" || a.platform === "both"))
      : true,
    ios: project.platforms.includes("ios")
      ? assetList.some((a) => a.asset_type === "icon" && (a.platform === "ios" || a.platform === "both"))
      : true,
  };

  // Check feature graphic status (Android only)
  const featureGraphicStatus = project.platforms.includes("android")
    ? assetList.some((a) => a.asset_type === "feature_graphic")
    : true;

  return {
    screenshots: screenshotStatus,
    icon: iconStatus,
    featureGraphic: featureGraphicStatus,
  };
}

// =============================================================================
// AI Chat
// =============================================================================

/**
 * Send a message to Launch AI and get a response
 */
export async function sendAIMessage(
  message: string,
  conversationId?: string,
  projectId?: string
): Promise<{
  conversation_id: string;
  message: string;
  usage?: { input_tokens: number; output_tokens: number };
} | null> {
  // DEV MODE: Return mock response (Edge Function requires auth)
  if (DEV_SKIP_AUTH) {
    console.log("🔓 DEV MODE: Mock AI message (Edge Function skipped):", message);
    return {
      conversation_id: conversationId || MOCK_CONV_ID,
      message: `[DEV MODE] Ich bin der Launch Assistant! Du hast geschrieben: "${message}"\n\nDie echte AI ist im DEV-Modus deaktiviert. Nutze den Welcome Assistant (WelcomeAssistantModal) für echte AI-Generierung.`,
      usage: { input_tokens: 0, output_tokens: 0 },
    };
  }

  if (!supabase) return null;

  const { data, error } = await supabase.functions.invoke("launch-ai-chat", {
    body: {
      message,
      conversation_id: conversationId,
      project_id: projectId,
    },
  });

  if (error) {
    console.error("Error calling Launch AI:", error);
    throw new Error(error.message || "Failed to get AI response");
  }

  return data;
}

// =============================================================================
// Assistant Sessions
// =============================================================================

/**
 * Create a new assistant session
 */
export async function createAssistantSession(): Promise<AssistantSession | null> {
  // DEV MODE: Return mock session
  if (DEV_SKIP_AUTH) {
    console.log("🔓 DEV MODE: Creating mock assistant session");
    return {
      id: MOCK_SESSION_ID,
      project_id: null,
      user_id: "00000000-0000-0000-0000-000000000001",
      organization_id: "00000000-0000-0000-0000-000000000002",
      current_phase: "discovery",
      current_step: 0,
      collected_data: {},
      generated_content: {},
      status: "active",
      phases_completed: [],
      conversation_id: MOCK_CONV_ID,
      started_at: new Date().toISOString(),
      paused_at: null,
      completed_at: null,
      last_interaction_at: new Date().toISOString(),
    } as AssistantSession;
  }

  if (!supabase) return null;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userData.user.id)
    .single();

  if (!membership) throw new Error("No organization found");

  // Create linked conversation
  const { data: conv } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: userData.user.id,
      title: "Launch Assistant",
      context_type: "assistant_session",
    })
    .select()
    .single();

  const { data, error } = await supabase
    .from("assistant_sessions")
    .insert({
      user_id: userData.user.id,
      organization_id: membership.organization_id,
      conversation_id: conv?.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating assistant session:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get the active assistant session for the current user
 */
export async function getActiveSession(): Promise<AssistantSession | null> {
  // DEV MODE: Return null (no active session)
  if (DEV_SKIP_AUTH) {
    return null;
  }

  if (!supabase) return null;

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from("assistant_sessions")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("status", "active")
      .order("last_interaction_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("assistant_sessions table may not exist:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn("Error fetching active session:", error);
    return null;
  }
}

/**
 * Get all paused sessions for the current user
 */
export async function getPausedSessions(): Promise<AssistantSession[]> {
  // DEV MODE: Return empty array
  if (DEV_SKIP_AUTH) {
    return [];
  }

  if (!supabase) return [];

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];

    const { data, error } = await supabase
      .from("assistant_sessions")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("status", "paused")
      .order("paused_at", { ascending: false });

    if (error) {
      console.warn("assistant_sessions table may not exist:", error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn("Error fetching paused sessions:", error);
    return [];
  }
}

/**
 * Resume a paused session
 */
export async function resumeSession(sessionId: string): Promise<AssistantSession | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("assistant_sessions")
    .update({
      status: "active",
      paused_at: null,
      last_interaction_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error resuming session:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Pause an active session
 */
export async function pauseSession(sessionId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from("assistant_sessions")
    .update({
      status: "paused",
      paused_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Error pausing session:", error);
    throw new Error(error.message);
  }
}

/**
 * Update an assistant session
 */
export async function updateAssistantSession(
  sessionId: string,
  updates: {
    current_phase?: string;
    current_step?: number;
    collected_data?: Record<string, unknown>;
    generated_content?: Record<string, unknown>;
    phases_completed?: string[];
    status?: string;
    project_id?: string;
  }
): Promise<AssistantSession | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("assistant_sessions")
    .update({
      ...updates,
      last_interaction_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("Error updating assistant session:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Send a message to the assistant and get a response
 */
export async function sendAssistantMessage(
  message: string,
  sessionId: string
): Promise<{
  conversation_id: string;
  message: string;
  session_update?: Partial<AssistantSession>;
  usage?: { input_tokens: number; output_tokens: number };
} | null> {
  // DEV MODE: Return mock response
  if (DEV_SKIP_AUTH) {
    console.log("🔓 DEV MODE: Mock assistant message:", message);
    return {
      conversation_id: MOCK_CONV_ID,
      message: `Super! "${message}" ist ein toller Name! 🚀\n\nWo liegt dein App-Code?\n\n• Auf deinem Computer\n• In einem GitHub Repository\n• Noch keinen Code`,
      session_update: {
        collected_data: { app_name: message },
        current_phase: "code_source",
      },
    };
  }

  if (!supabase) return null;

  const { data, error } = await supabase.functions.invoke("launch-ai-chat", {
    body: {
      message,
      session_id: sessionId,
      mode: "assistant",
    },
  });

  if (error) {
    console.error("Error calling Launch AI Assistant:", error);
    throw new Error(error.message || "Failed to get AI response");
  }

  return data;
}

/**
 * Complete an assistant session
 */
export async function completeSession(sessionId: string): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from("assistant_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error("Error completing session:", error);
    throw new Error(error.message);
  }
}

// =============================================================================
// Export all endpoints
// =============================================================================

export const appLaunchEndpoints = {
  // Projects
  getAppProjects,
  getAppProject,
  createAppProject,
  updateAppProject,
  deleteAppProject,

  // Checklist
  getProjectChecklist,
  toggleChecklistItem,

  // Conversations
  getConversations,
  getConversation,
  createConversation,
  addMessage,
  updateConversationTitle,

  // Beta Testers
  getBetaTesters,
  inviteBetaTesters,

  // Releases
  getReleases,
  createRelease,

  // Stats
  getAppLaunchStats,

  // AI Chat
  sendAIMessage,

  // Assets
  getProjectAssets,
  uploadAsset,
  updateAsset,
  deleteAsset,
  reorderAssets,
  getAssetRequirementsStatus,

  // Assistant Sessions
  createAssistantSession,
  getActiveSession,
  getPausedSessions,
  resumeSession,
  pauseSession,
  updateAssistantSession,
  sendAssistantMessage,
  completeSession,
};
