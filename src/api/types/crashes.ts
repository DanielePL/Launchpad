// Crashlytics Types (BigQuery Schema)

export interface CrashEvent {
  id: string;
  event_timestamp: string;
  app_version: string;
  device_model: string;
  os_version: string;
  user_id?: string;
  issue_id: string;
  issue_title: string;
  issue_subtitle?: string;
  blame_frame?: string;
  crash_type: "crash" | "non_fatal" | "anr";
  platform: "android" | "ios";
}

export interface CrashIssue {
  issue_id: string;
  issue_title: string;
  issue_subtitle?: string;
  blame_frame?: string;
  crash_type: "crash" | "non_fatal" | "anr";
  first_seen: string;
  last_seen: string;
  event_count: number;
  user_count: number;
  app_versions: string[];
  status: "open" | "closed" | "muted";
  platform: "android" | "ios";
}

export interface CrashStats {
  total_crashes_today: number;
  total_crashes_week: number;
  affected_users_today: number;
  affected_users_week: number;
  crash_free_users_percent: number;
  top_issues: CrashIssue[];
  crashes_by_version: {
    version: string;
    count: number;
  }[];
  crashes_by_day: {
    date: string;
    crashes: number;
    non_fatals: number;
    anrs: number;
  }[];
}

export interface CrashFilters {
  platform?: "android" | "ios";
  crash_type?: "crash" | "non_fatal" | "anr";
  app_version?: string;
  status?: "open" | "closed" | "muted";
  date_from?: string;
  date_to?: string;
  search?: string;
}
