// Asana API Types

export interface AsanaUser {
  gid: string;
  name: string;
  email?: string;
  photo?: {
    image_128x128: string;
  };
}

export interface AsanaProject {
  gid: string;
  name: string;
  color?: string;
}

export interface AsanaTask {
  gid: string;
  name: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: AsanaUser | null;
  assignee: AsanaUser | null;
  due_on: string | null;
  due_at: string | null;
  created_at: string;
  modified_at: string;
  notes: string;
  projects: AsanaProject[];
  tags: { gid: string; name: string }[];
  custom_fields?: AsanaCustomField[];
}

export interface AsanaCustomField {
  gid: string;
  name: string;
  display_value: string | null;
  number_value?: number;
  text_value?: string;
}

export interface AsanaWorkspace {
  gid: string;
  name: string;
}

export interface AsanaTaskCount {
  num_tasks: number;
  num_completed_tasks: number;
  num_incomplete_tasks: number;
}

// API Response wrapper
export interface AsanaResponse<T> {
  data: T;
  next_page?: {
    offset: string;
    path: string;
    uri: string;
  };
}

// Configuration
export interface AsanaConfig {
  accessToken: string;
  workspaceGid?: string;
}
