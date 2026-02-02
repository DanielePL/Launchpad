// =============================================================================
// App Launch Types
// =============================================================================

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export type Platform = "android" | "ios";

export type ProjectStatus =
  | "setup"
  | "preparing"
  | "beta"
  | "review"
  | "approved"
  | "live"
  | "updating";

export type ChecklistCategory =
  | "setup"
  | "store_listing"
  | "assets"
  | "compliance"
  | "beta"
  | "release";

export type AssetType =
  | "screenshot"
  | "icon"
  | "feature_graphic"
  | "promo_video"
  | "tv_banner"
  | "wear_screenshot"
  | "app_preview";

export type BetaTesterStatus = "invited" | "active" | "inactive" | "removed";

export type ReleaseTrack =
  | "internal"
  | "alpha"
  | "closed_beta"
  | "open_beta"
  | "production";

export type ReleaseStatus =
  | "draft"
  | "uploading"
  | "processing"
  | "pending_review"
  | "in_review"
  | "approved"
  | "rejected"
  | "released"
  | "halted"
  | "superseded";

export type DocumentType =
  | "privacy_policy"
  | "terms_of_service"
  | "eula"
  | "data_deletion"
  | "support_url";

export type CredentialPlatform = "google_play" | "app_store";

export type ConversationStatus = "active" | "archived" | "resolved";

export type MessageRole = "user" | "assistant" | "system";

// -----------------------------------------------------------------------------
// App Project
// -----------------------------------------------------------------------------

export interface AppProject {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  package_name: string | null;
  bundle_id: string | null;
  platforms: Platform[];
  status: ProjectStatus;
  completion_percentage: number;
  target_launch_date: string | null;
  launched_at: string | null;
  google_play_url: string | null;
  app_store_url: string | null;
  app_category: string | null;
  content_rating: string | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateAppProjectInput {
  name: string;
  description?: string;
  platforms: Platform[];
  package_name?: string;
  bundle_id?: string;
  target_launch_date?: string;
  app_category?: string;
}

export interface UpdateAppProjectInput {
  name?: string;
  description?: string;
  package_name?: string;
  bundle_id?: string;
  status?: ProjectStatus;
  target_launch_date?: string;
  app_category?: string;
  content_rating?: string;
  icon_url?: string;
  google_play_url?: string;
  app_store_url?: string;
}

// -----------------------------------------------------------------------------
// Checklist Items
// -----------------------------------------------------------------------------

export interface ChecklistItem {
  id: string;
  project_id: string;
  category: ChecklistCategory;
  item_key: string;
  sort_order: number;
  title: string;
  description: string | null;
  help_text: string | null;
  is_required: boolean;
  is_completed: boolean;
  is_blocked: boolean;
  blocked_reason: string | null;
  completed_at: string | null;
  completed_by: string | null;
  platform: Platform | null;
  created_at: string;
}

export interface ChecklistProgress {
  category: ChecklistCategory;
  total: number;
  completed: number;
  percentage: number;
}

// -----------------------------------------------------------------------------
// Store Credentials
// -----------------------------------------------------------------------------

export interface StoreCredential {
  id: string;
  organization_id: string;
  platform: CredentialPlatform;
  credential_type: string;
  name: string;
  is_valid: boolean;
  last_validated_at: string | null;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateCredentialInput {
  platform: CredentialPlatform;
  credential_type: string;
  name: string;
  data: string; // Will be encrypted
  metadata?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// AI Conversations
// -----------------------------------------------------------------------------

export interface AIConversation {
  id: string;
  organization_id: string;
  project_id: string | null;
  user_id: string;
  title: string | null;
  summary: string | null;
  status: ConversationStatus;
  context_type: string | null;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  attachments: MessageAttachment[];
  suggested_actions: SuggestedAction[];
  tool_calls: ToolCall[];
  tool_results: ToolResult[];
  tokens_used: number | null;
  model_used: string | null;
  created_at: string;
}

export interface MessageAttachment {
  type: "image" | "file" | "link";
  url: string;
  name: string;
  size?: number;
}

export interface SuggestedAction {
  label: string;
  action: string;
  params?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  tool_call_id: string;
  result: unknown;
}

export interface CreateConversationInput {
  project_id?: string;
  title?: string;
  context_type?: string;
}

export interface SendMessageInput {
  content: string;
  attachments?: MessageAttachment[];
}

// -----------------------------------------------------------------------------
// Project Assets
// -----------------------------------------------------------------------------

export interface ProjectAsset {
  id: string;
  project_id: string;
  organization_id: string;
  asset_type: AssetType;
  name: string;
  platform: Platform | "both";
  device_type: string | null;
  file_path: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  is_approved: boolean;
  approval_notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  uploaded_by: string | null;
}

export interface UploadAssetInput {
  project_id: string;
  asset_type: AssetType;
  name: string;
  platform: Platform | "both";
  device_type?: string;
  file: File;
  metadata?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Beta Testers
// -----------------------------------------------------------------------------

export interface BetaTester {
  id: string;
  project_id: string;
  organization_id: string;
  email: string;
  name: string | null;
  platform: Platform | "both";
  group_name: string;
  status: BetaTesterStatus;
  installed_at: string | null;
  last_active_at: string | null;
  feedback_count: number;
  crash_count: number;
  invite_token: string | null;
  invited_at: string;
  invite_expires_at: string | null;
  created_at: string;
}

export interface InviteTesterInput {
  project_id: string;
  email: string;
  name?: string;
  platform: Platform | "both";
  group_name?: string;
}

// -----------------------------------------------------------------------------
// Releases
// -----------------------------------------------------------------------------

export interface AppRelease {
  id: string;
  project_id: string;
  organization_id: string;
  platform: Platform;
  version_name: string;
  version_code: number | null;
  track: ReleaseTrack;
  rollout_percentage: number;
  status: ReleaseStatus;
  submitted_at: string | null;
  review_started_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  released_at: string | null;
  changelog: Record<string, string>;
  build_file_path: string | null;
  build_file_size: number | null;
  build_sha256: string | null;
  store_release_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateReleaseInput {
  project_id: string;
  platform: Platform;
  version_name: string;
  version_code?: number;
  track?: ReleaseTrack;
  changelog?: Record<string, string>;
}

// -----------------------------------------------------------------------------
// Compliance Documents
// -----------------------------------------------------------------------------

export interface ComplianceDocument {
  id: string;
  project_id: string | null;
  organization_id: string;
  document_type: DocumentType;
  content: string | null;
  hosted_url: string | null;
  external_url: string | null;
  locale: string;
  is_published: boolean;
  published_at: string | null;
  generated_by_ai: boolean;
  ai_prompt_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateDocumentInput {
  project_id?: string;
  document_type: DocumentType;
  locale?: string;
  app_info: {
    name: string;
    description: string;
    data_collected: string[];
    third_party_services: string[];
    contact_email: string;
    company_name: string;
  };
}

// -----------------------------------------------------------------------------
// Dashboard Stats
// -----------------------------------------------------------------------------

export interface AppLaunchStats {
  total_projects: number;
  projects_by_status: Record<ProjectStatus, number>;
  active_beta_testers: number;
  pending_reviews: number;
  live_apps: number;
}

// -----------------------------------------------------------------------------
// Screenshot Requirements
// -----------------------------------------------------------------------------

export interface ScreenshotRequirement {
  platform: Platform;
  device_type: string;
  device_name: string;
  width: number;
  height: number;
  required: boolean;
  max_count: number;
}

export const SCREENSHOT_REQUIREMENTS: ScreenshotRequirement[] = [
  // Android
  { platform: "android", device_type: "phone", device_name: "Phone", width: 1080, height: 1920, required: true, max_count: 8 },
  { platform: "android", device_type: "phone_tall", device_name: "Phone (Tall)", width: 1080, height: 2340, required: false, max_count: 8 },
  { platform: "android", device_type: "tablet_7", device_name: "7\" Tablet", width: 1200, height: 1920, required: false, max_count: 8 },
  { platform: "android", device_type: "tablet_10", device_name: "10\" Tablet", width: 1600, height: 2560, required: false, max_count: 8 },

  // iOS
  { platform: "ios", device_type: "iphone_6.7", device_name: "iPhone 6.7\"", width: 1290, height: 2796, required: true, max_count: 10 },
  { platform: "ios", device_type: "iphone_6.5", device_name: "iPhone 6.5\"", width: 1284, height: 2778, required: true, max_count: 10 },
  { platform: "ios", device_type: "iphone_5.5", device_name: "iPhone 5.5\"", width: 1242, height: 2208, required: false, max_count: 10 },
  { platform: "ios", device_type: "ipad_12.9", device_name: "iPad Pro 12.9\"", width: 2048, height: 2732, required: true, max_count: 10 },
  { platform: "ios", device_type: "ipad_11", device_name: "iPad Pro 11\"", width: 1668, height: 2388, required: false, max_count: 10 },
];

// -----------------------------------------------------------------------------
// App Categories
// -----------------------------------------------------------------------------

export const APP_CATEGORIES = {
  android: [
    "Art & Design", "Auto & Vehicles", "Beauty", "Books & Reference",
    "Business", "Comics", "Communication", "Dating", "Education",
    "Entertainment", "Events", "Finance", "Food & Drink", "Health & Fitness",
    "House & Home", "Libraries & Demo", "Lifestyle", "Maps & Navigation",
    "Medical", "Music & Audio", "News & Magazines", "Parenting",
    "Personalization", "Photography", "Productivity", "Shopping", "Social",
    "Sports", "Tools", "Travel & Local", "Video Players & Editors", "Weather",
    "Games"
  ],
  ios: [
    "Books", "Business", "Developer Tools", "Education", "Entertainment",
    "Finance", "Food & Drink", "Games", "Graphics & Design", "Health & Fitness",
    "Lifestyle", "Kids", "Magazines & Newspapers", "Medical", "Music",
    "Navigation", "News", "Photo & Video", "Productivity", "Reference",
    "Shopping", "Social Networking", "Sports", "Travel", "Utilities", "Weather"
  ]
};

// -----------------------------------------------------------------------------
// Asset Studio Types
// -----------------------------------------------------------------------------

export interface UpdateAssetInput {
  name?: string;
  sort_order?: number;
  is_approved?: boolean;
  approval_notes?: string;
  locale?: string;
}

export interface AssetFilters {
  asset_type?: AssetType;
  platform?: Platform | "both";
  device_type?: string;
  locale?: string;
}

export interface RequirementStatus {
  device_type: string;
  device_name: string;
  required: boolean;
  min_count: number;
  max_count: number;
  uploaded_count: number;
  is_satisfied: boolean;
}

export interface AssetRequirementsStatus {
  screenshots: {
    android: RequirementStatus[];
    ios: RequirementStatus[];
  };
  icon: {
    android: boolean;
    ios: boolean;
  };
  featureGraphic: boolean;
}

export interface IconRequirement {
  size: number;
  name: string;
  required: boolean;
}

export const ICON_REQUIREMENTS: Record<Platform, IconRequirement[]> = {
  android: [
    { size: 512, name: "Play Store Icon", required: true },
  ],
  ios: [
    { size: 1024, name: "App Store Icon", required: true },
  ],
};

export const FEATURE_GRAPHIC_REQUIREMENTS = {
  width: 1024,
  height: 500,
  required: true,
};
