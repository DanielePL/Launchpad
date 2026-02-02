import { supabase } from "@/api/supabaseClient";
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
} from "@/api/types/appLaunch";

// =============================================================================
// App Projects
// =============================================================================

/**
 * Get all app projects for the organization
 */
export async function getAppProjects(): Promise<AppProject[]> {
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
};
