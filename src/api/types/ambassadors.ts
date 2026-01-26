// Ambassador Types

export type AmbassadorStatus = "contacted" | "onboarding" | "active" | "paused" | "terminated";
export type ContentType = "video" | "photo" | "story" | "reel";
export type DeliverableStatus = "assigned" | "in_progress" | "delivered" | "approved" | "rejected";

export interface Ambassador {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tiktok_handle?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  profile_photo_url?: string;
  sport?: string;
  status: AmbassadorStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AmbassadorCreate {
  name: string;
  email: string;
  phone?: string;
  tiktok_handle?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  profile_photo_url?: string;
  sport?: string;
  status?: AmbassadorStatus;
  notes?: string;
}

export interface AmbassadorUpdate {
  name?: string;
  email?: string;
  phone?: string;
  tiktok_handle?: string;
  instagram_handle?: string;
  youtube_handle?: string;
  profile_photo_url?: string;
  sport?: string;
  status?: AmbassadorStatus;
  notes?: string;
}

export interface AmbassadorDeliverable {
  id: string;
  ambassador_id: string;
  content_type: ContentType;
  status: DeliverableStatus;
  title: string;
  description?: string;
  delivery_date?: string;
  delivered_at?: string;
  content_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliverableCreate {
  ambassador_id: string;
  content_type: ContentType;
  title: string;
  description?: string;
  delivery_date?: string;
  content_url?: string;
  notes?: string;
}

export interface DeliverableUpdate {
  content_type?: ContentType;
  status?: DeliverableStatus;
  title?: string;
  description?: string;
  delivery_date?: string;
  delivered_at?: string;
  content_url?: string;
  notes?: string;
}

export interface AmbassadorStats {
  total: number;
  active: number;
  delivered_this_month: number;
  pending: number;
}

export interface AmbassadorFilters {
  status?: AmbassadorStatus;
  sport?: string;
  search?: string;
  sort_by?: "name" | "email" | "created_at" | "status";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// Status display config
export const AMBASSADOR_STATUS_CONFIG: Record<AmbassadorStatus, { label: string; color: string; bg: string }> = {
  contacted: { label: "Contacted", color: "text-blue-500", bg: "bg-blue-500/20" },
  onboarding: { label: "Onboarding", color: "text-yellow-500", bg: "bg-yellow-500/20" },
  active: { label: "Active", color: "text-green-500", bg: "bg-green-500/20" },
  paused: { label: "Paused", color: "text-orange-500", bg: "bg-orange-500/20" },
  terminated: { label: "Terminated", color: "text-red-500", bg: "bg-red-500/20" },
};

export const DELIVERABLE_STATUS_CONFIG: Record<DeliverableStatus, { label: string; color: string; bg: string }> = {
  assigned: { label: "Assigned", color: "text-blue-500", bg: "bg-blue-500/20" },
  in_progress: { label: "In Progress", color: "text-yellow-500", bg: "bg-yellow-500/20" },
  delivered: { label: "Delivered", color: "text-purple-500", bg: "bg-purple-500/20" },
  approved: { label: "Approved", color: "text-green-500", bg: "bg-green-500/20" },
  rejected: { label: "Rejected", color: "text-red-500", bg: "bg-red-500/20" },
};

export const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string }> = {
  video: { label: "Video" },
  photo: { label: "Photo" },
  story: { label: "Story" },
  reel: { label: "Reel" },
};

export const SPORT_OPTIONS = [
  "Football",
  "Basketball",
  "Tennis",
  "Swimming",
  "Athletics",
  "Volleyball",
  "Hockey",
  "Rugby",
  "Cricket",
  "Boxing",
  "MMA",
  "Cycling",
  "Gymnastics",
  "Skiing",
  "Snowboarding",
  "Surfing",
  "Skateboarding",
  "CrossFit",
  "Yoga",
  "Running",
  "Other",
];
